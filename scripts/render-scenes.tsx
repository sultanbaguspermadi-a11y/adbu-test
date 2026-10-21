/**
 * Bakes every scene plane (Harbor sky/clouds/sea/quay/grade, six Market backgrounds, wide + narrow) into WebP files in
 * public/scenes/. The same React layer components the game uses as vector fallback are rendered to static SVG, rasterised
 * at 2x with sharp, softened, given a brush-streak canvas grain (masked by each plane's own alpha) and saved.
 *
 *   npm run scenes:render
 *
 * Re-run after changing any layer component. The output is deterministic (seeded noise), so diffs stay meaningful.
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { createElement as h, type ReactElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import sharp from 'sharp'
import { HarborCloudsLayer, HarborGradeLayer, HarborQuayLayer, HarborSeaLayer, HarborSkyLayer, harborGeometry } from '../src/components/game/HarborBackdrop'
import { MarketShadeLayer } from '../src/components/game/MarketAtmosphere'
import { BACKGROUNDS } from '../src/components/game/marketBackgrounds'
import { EntityShape } from '../src/components/game/EntityIcon'
import { SPRITE_BLEED, SPRITE_KINDS, spriteFile } from '../src/components/game/sceneAssets'
import { MARKET_SCENES } from '../src/themes/scenes'

const OUT = join(process.cwd(), 'public', 'scenes')
const SCALE = 2

interface Job { file: string; w: number; h: number; draw: () => ReactElement; blur: number; grain: { amp: number; cellW: number; cellH: number } | null }

/** Deterministic 2-D integer hash in [0,1): uncorrelated across rows and columns (a sequential LCG leaves visible streaks). */
const hash = (x: number, y: number, seed: number) => {
  let n = (Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(seed, 2246822519)) | 0
  n = Math.imul(n ^ (n >>> 13), 1274126177)
  n ^= n >>> 16
  return (n >>> 0) / 4294967296
}

function jobs(): Job[] {
  const list: Job[] = []
  for (const narrow of [false, true]) {
    const o = narrow ? 'narrow' : 'wide'
    const geo = { ...harborGeometry(narrow), narrow }
    const base = { w: geo.W, h: geo.H }
    list.push(
      { file: `harbor/${o}-sky`, ...base, draw: () => h(HarborSkyLayer, geo), blur: 0.7, grain: { amp: 5, cellW: 26, cellH: 3 } },
      { file: `harbor/${o}-clouds`, ...base, draw: () => h(HarborCloudsLayer, geo), blur: 1.6, grain: null },
      { file: `harbor/${o}-sea`, ...base, draw: () => h(HarborSeaLayer, geo), blur: 0.7, grain: { amp: 5, cellW: 22, cellH: 2 } },
      { file: `harbor/${o}-quay`, ...base, draw: () => h(HarborQuayLayer, geo), blur: 0.5, grain: { amp: 6, cellW: 6, cellH: 4 } },
      { file: `harbor/${o}-grade`, ...base, draw: () => h(HarborGradeLayer, geo), blur: 8, grain: null },
    )
  }
  for (const scene of MARKET_SCENES) {
    for (const narrow of [false, true]) {
      const w = narrow ? 400 : 800
      const hh = narrow ? 440 : 460
      const Back = BACKGROUNDS[scene]
      list.push({
        file: `market/${scene}-${narrow ? 'narrow' : 'wide'}`, w, h: hh, blur: 0.5, grain: { amp: 6, cellW: 7, cellH: 4 },
        draw: () => h('g', null, h(Back, { w, h: hh }), h(MarketShadeLayer, { scene, w, h: hh })),
      })
    }
  }
  return list
}

/** Adds layered noise (fine speckle + coarse brush streaks) to RGB, leaving alpha untouched so transparent areas stay clean. */
function addGrain(px: Buffer, width: number, height: number, g: NonNullable<Job['grain']>, seed: number) {
  const cw = g.cellW * SCALE
  const ch = g.cellH * SCALE
  for (let y = 0; y < height; y++) {
    const cy = Math.floor(y / ch)
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4
      if (px[i + 3] === 0) continue
      const n = ((hash(Math.floor(x / cw), cy, seed) - 0.5) * 1.4 + (hash(x, y, seed + 7) - 0.5) * 0.7) * g.amp
      px[i] = Math.max(0, Math.min(255, px[i] + n))
      px[i + 1] = Math.max(0, Math.min(255, px[i + 1] + n))
      px[i + 2] = Math.max(0, Math.min(255, px[i + 2] + n * 0.9))
    }
  }
}

/**
 * Gives a flat glyph volume: a blurred copy of its alpha acts as a height field, lit from the upper left. Lit edges warm
 * and brighten, shaded edges and the underside darken, and a soft ink contour separates the sprite from the backdrop.
 */
async function lightSprite(px: Buffer, W: number, H: number) {
  // height field = float Gaussian blur of alpha (8-bit blur leaves stair-steps that show up as banding once differentiated)
  const sigma = 5
  const R = Math.ceil(sigma * 3)
  const kernel = Array.from({ length: R * 2 + 1 }, (_, k) => Math.exp(-((k - R) ** 2) / (2 * sigma * sigma)))
  const ksum = kernel.reduce((a, b) => a + b, 0)
  const src = new Float32Array(W * H)
  for (let i = 0; i < W * H; i++) src[i] = px[i * 4 + 3] / 255
  const tmp = new Float32Array(W * H)
  const field = new Float32Array(W * H)
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { let a = 0; for (let k = -R; k <= R; k++) a += src[y * W + Math.max(0, Math.min(W - 1, x + k))] * kernel[k + R]; tmp[y * W + x] = a / ksum }
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { let a = 0; for (let k = -R; k <= R; k++) a += tmp[Math.max(0, Math.min(H - 1, y + k)) * W + x] * kernel[k + R]; field[y * W + x] = a / ksum }
  const at = (x: number, y: number) => field[Math.max(0, Math.min(H - 1, y)) * W + Math.max(0, Math.min(W - 1, x))]
  const D = 4
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4
      if (px[i + 3] === 0) continue
      const gx = (at(x + D, y) - at(x - D, y)) / (2 * D)
      const gy = (at(x, y + D) - at(x, y - D)) / (2 * D)
      const lit = Math.max(-0.16, Math.min(0.14, (gx * 0.6 + gy * 0.8) * 3.2)) // lit from the upper left
      const edge = at(x, y)
      const contour = edge < 0.9 ? 0.9 + 0.1 * (edge / 0.9) : 1
      const form = (1.05 - 0.12 * (y / H)) * (1 + lit) * contour
      px[i] = Math.min(255, px[i] * form)
      px[i + 1] = Math.min(255, px[i + 1] * form)
      px[i + 2] = Math.min(255, px[i + 2] * form)
    }
  }
}

async function bakeSprites() {
  const box = 64 + SPRITE_BLEED * 2
  const px4 = 4
  const W = box * px4
  let total = 0
  for (const [n, kind] of SPRITE_KINDS.entries()) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${W}" viewBox="${-SPRITE_BLEED} ${-SPRITE_BLEED} ${box} ${box}">${renderToStaticMarkup(h('g', null, h(EntityShape, { kind })))}</svg>`
    const { data } = await sharp(Buffer.from(svg)).ensureAlpha().blur(0.5).raw().toBuffer({ resolveWithObject: true })
    const px = Buffer.from(data)
    await lightSprite(px, W, W)
    addGrain(px, W, W, { amp: 4, cellW: 2, cellH: 2 }, 5000 + n)
    const out = await sharp(px, { raw: { width: W, height: W, channels: 4 } }).webp({ quality: 90, alphaQuality: 95, effort: 5, smartSubsample: true }).toBuffer()
    const path = join(OUT, `${spriteFile(kind)}.webp`)
    mkdirSync(dirname(path), { recursive: true })
    writeFileSync(path, out)
    total += out.length
  }
  console.log(`${SPRITE_KINDS.length} sprites, ${(total / 1024).toFixed(0)} KB total -> public/scenes/sprites/`)
}

async function main() {
  let total = 0
  let idx = 0
  for (const job of jobs()) {
    const W = job.w * SCALE
    const H = job.h * SCALE
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${job.w} ${job.h}">${renderToStaticMarkup(job.draw())}</svg>`
    let img = sharp(Buffer.from(svg)).ensureAlpha()
    if (job.blur > 0) img = img.blur(job.blur)
    img = img.modulate({ saturation: 1.06 })
    const { data } = await img.raw().toBuffer({ resolveWithObject: true })
    const px = Buffer.from(data)
    if (job.grain) addGrain(px, W, H, job.grain, 1000 + idx)
    const out = await sharp(px, { raw: { width: W, height: H, channels: 4 } }).webp({ quality: 82, alphaQuality: 90, effort: 5, smartSubsample: true }).toBuffer()
    const path = join(OUT, `${job.file}.webp`)
    mkdirSync(dirname(path), { recursive: true })
    writeFileSync(path, out)
    total += out.length
    console.log(`${job.file.padEnd(26)} ${String(W).padStart(4)}x${String(H).padEnd(4)} ${(out.length / 1024).toFixed(0).padStart(4)} KB`)
    idx++
  }
  console.log(`\n${idx} planes, ${(total / 1024).toFixed(0)} KB total -> public/scenes/`)
  await bakeSprites()
}

main().catch((e) => { console.error(e); process.exit(1) })
