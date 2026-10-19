import type { ReactElement } from 'react'
import type { EntityKind, MarketEntityKind } from '../../types'
import { isMarketScene } from '../../themes/scenes'
import type { MarketSceneId } from '../../themes/scenes'
import { SceneHotspot } from './SceneHotspot'
import type { SceneProps } from './sceneProps'
import { useNarrow } from './useNarrow'

/**
 * Market world scenes: six distinct environments drawn from the same props (awnings, shelves, crates, bolts of cloth, ledgers).
 * Backgrounds are functions of the canvas size so they stay composed on wide and narrow screens; interactive things sit
 * at hand-placed spots on wide canvases and in an automatic grid on narrow ones.
 */
const P = {
  wall: '#E9D8B4', wallDark: '#D2BE95', wood: '#B8844B', woodDark: '#6B4A27', floor: '#8E6B47', cream: '#F6EEDC', red: '#C8453B', teal: '#2E8B9A',
  amber: '#F2B33D', green: '#4F9D69', blue: '#3E7CB1', stone: '#B9AE98', stoneDark: '#8F8572', kraft: '#C9A06A', ink: '#1F2A36', sky: '#F4C98A', cloth: '#D98A5B',
}
type Bg = (a: { w: number; h: number }) => ReactElement
interface Spot { x: number; by: number; s: number } // x as a fraction of width, by as a fraction of height

const stripes = (w: number, y: number, h: number, n: number, a: string, b: string, x0 = 0) =>
  Array.from({ length: n }, (_, i) => <rect key={i} x={x0 + (w / n) * i} y={y} width={w / n + 0.5} height={h} fill={i % 2 ? b : a} />)
const scallops = (w: number, y: number, n: number, color: string) =>
  Array.from({ length: n }, (_, i) => <path key={i} d={`M${(w / n) * i} ${y} h${w / n} a${w / n / 2} ${w / n / 2.6} 0 0 1 ${-w / n} 0 Z`} fill={color} />)

const BACKGROUNDS: Record<MarketSceneId, Bg> = {
  entrance: ({ w, h }) => (
    <g>
      <rect width={w} height={h} fill={P.sky} /><rect y={h * 0.58} width={w} height={h * 0.42} fill={P.stone} />
      {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M0 ${h * 0.6 + i * (h * 0.045)} H${w}`} stroke={P.stoneDark} strokeWidth="1" opacity=".5" />)}
      {[0.06, 0.74].map((x, i) => (
        <g key={i}><rect x={w * x} y={h * 0.3} width={w * 0.2} height={h * 0.3} fill={P.wallDark} />{stripes(w * 0.2, h * 0.24, h * 0.08, 5, P.red, P.cream, w * x)}</g>
      ))}
      <path d={`M${w * 0.3} ${h * 0.6} V${h * 0.28} a${w * 0.2} ${w * 0.2} 0 0 1 ${w * 0.4} 0 V${h * 0.6} H${w * 0.64} V${h * 0.3} a${w * 0.14} ${w * 0.14} 0 0 0 ${-w * 0.28} 0 V${h * 0.6} Z`} fill={P.wood} />
      <path d={`M0 ${h * 0.1} Q${w / 2} ${h * 0.2} ${w} ${h * 0.1}`} stroke={P.woodDark} strokeWidth="2" fill="none" />
      {Array.from({ length: 10 }, (_, i) => <path key={i} d={`M${(w / 10) * (i + 0.5)} ${h * 0.1 + Math.sin((i + 0.5) / 10 * Math.PI) * h * 0.06} l9 0 l-4.5 18 z`} fill={[P.red, P.amber, P.teal, P.green][i % 4]} />)}
    </g>
  ),
  shop: ({ w, h }) => (
    <g>
      <rect width={w} height={h} fill={P.wall} /><rect y={h * 0.72} width={w} height={h * 0.28} fill={P.floor} />
      {Array.from({ length: 12 }, (_, i) => <path key={i} d={`M${(w / 12) * i} ${h * 0.72} L${(w / 12) * i - 30} ${h}`} stroke={P.woodDark} strokeWidth="1.2" opacity=".35" />)}
      {[0.14, 0.3, 0.46].map((y, i) => (
        <g key={i}><rect x={w * 0.04} y={h * y} width={w * 0.92} height="7" fill={P.wood} /><rect x={w * 0.04} y={h * y + 7} width={w * 0.92} height="3" fill={P.woodDark} opacity=".4" />
          {Array.from({ length: 11 }, (_, k) => <rect key={k} x={w * 0.07 + k * (w * 0.082)} y={h * y - 26 + (k % 3) * 4} width={w * 0.05} height={26 - (k % 3) * 4} fill={[P.teal, P.red, P.amber, P.blue, P.green][(k + i) % 5]} opacity=".85" />)}
        </g>
      ))}
      <rect x="0" y={h * 0.62} width={w} height={h * 0.1} fill={P.wood} /><rect x="0" y={h * 0.62} width={w} height="6" fill={P.woodDark} opacity=".5" />
    </g>
  ),
  produce: ({ w, h }) => (
    <g>
      <rect width={w} height={h} fill="#CFE3D4" /><rect y={h * 0.66} width={w} height={h * 0.34} fill={P.stone} />
      {stripes(w, 0, h * 0.2, 10, P.green, P.cream)}{scallops(w, h * 0.2, 10, P.green)}
      <rect x={w * 0.06} y={h * 0.22} width={w * 0.1} height={h * 0.44} fill={P.woodDark} /><rect x={w * 0.84} y={h * 0.22} width={w * 0.1} height={h * 0.44} fill={P.woodDark} />
      <rect x={w * 0.2} y={h * 0.27} width={w * 0.6} height={h * 0.15} rx="4" fill="#2A3A33" /><path d={`M${w * 0.24} ${h * 0.32} h${w * 0.2} M${w * 0.24} ${h * 0.37} h${w * 0.3}`} stroke={P.cream} strokeWidth="3" opacity=".7" />
      <rect x={w * 0.04} y={h * 0.58} width={w * 0.92} height={h * 0.12} fill={P.wood} /><rect x={w * 0.04} y={h * 0.58} width={w * 0.92} height="6" fill={P.woodDark} opacity=".5" />
      {Array.from({ length: 14 }, (_, i) => <circle key={i} cx={w * 0.08 + i * (w * 0.065)} cy={h * 0.575} r="9" fill={[P.red, P.amber, P.green][i % 3]} />)}
    </g>
  ),
  textile: ({ w, h }) => (
    <g>
      <rect width={w} height={h} fill="#E8D5E0" /><rect y={h * 0.7} width={w} height={h * 0.3} fill="#9C7B6B" />
      <rect x={w * 0.05} y={h * 0.16} width={w * 0.9} height="6" fill={P.woodDark} /><rect x={w * 0.05} y={h * 0.16} width="6" height={h * 0.54} fill={P.woodDark} /><rect x={w * 0.95 - 6} y={h * 0.16} width="6" height={h * 0.54} fill={P.woodDark} />
      {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M${w * 0.1 + i * (w * 0.098)} ${h * 0.17} l-14 14 v${h * 0.2} h28 v${-h * 0.2} z`} fill={[P.red, P.blue, P.green, P.amber, P.cream, P.teal][i % 6]} />)}
      {Array.from({ length: 6 }, (_, i) => <g key={i}><rect x={w * 0.08 + i * (w * 0.15)} y={h * 0.6} width={w * 0.12} height="22" rx="11" fill={[P.teal, P.red, P.amber, P.blue, P.green, P.cloth][i]} /><circle cx={w * 0.08 + i * (w * 0.15) + w * 0.06} cy={h * 0.6 + 11} r="7" fill={P.cream} opacity=".6" /></g>)}
      <rect x="0" y={h * 0.66} width={w} height={h * 0.06} fill={P.wood} />
    </g>
  ),
  storage: ({ w, h }) => (
    <g>
      <rect width={w} height={h} fill="#BFC5CC" /><rect y={h * 0.72} width={w} height={h * 0.28} fill="#8E949B" />
      <rect x={w * 0.36} y={h * 0.08} width={w * 0.28} height={h * 0.5} fill="#7A8591" />{Array.from({ length: 9 }, (_, i) => <path key={i} d={`M${w * 0.36} ${h * 0.08 + i * (h * 0.056)} h${w * 0.28}`} stroke="#5F6A75" strokeWidth="2" />)}
      {[0.04, 0.7].map((x, i) => (
        <g key={i}>{[0.2, 0.4, 0.58].map((y, k) => <rect key={k} x={w * x} y={h * y} width={w * 0.26} height="6" fill="#5F6A75" />)}<rect x={w * x} y={h * 0.2} width="6" height={h * 0.42} fill="#5F6A75" /><rect x={w * x + w * 0.26 - 6} y={h * 0.2} width="6" height={h * 0.42} fill="#5F6A75" />
          {[0.2, 0.4, 0.58].map((y, k) => <rect key={k} x={w * x + 12} y={h * y - 30} width={w * 0.1} height="30" fill={P.kraft} />)}</g>
      ))}
      <circle cx={w / 2} cy="8" r="0" /><path d={`M${w / 2} 0 V${h * 0.05}`} stroke={P.ink} strokeWidth="2" /><path d={`M${w / 2 - 22} ${h * 0.09} L${w / 2} ${h * 0.05} L${w / 2 + 22} ${h * 0.09} Z`} fill={P.amber} />
      <rect x={w * 0.3} y={h * 0.66} width={w * 0.4} height="10" fill={P.woodDark} />
    </g>
  ),
  office: ({ w, h }) => (
    <g>
      <rect width={w} height={h} fill="#D9CDB4" /><rect y={h * 0.74} width={w} height={h * 0.26} fill="#7B5A3C" />
      <rect x={w * 0.08} y={h * 0.1} width={w * 0.24} height={h * 0.34} fill="#BFE0EE" /><path d={`M${w * 0.08} ${h * 0.1 + 14} H${w * 0.32} M${w * 0.08} ${h * 0.1 + 34} H${w * 0.32} M${w * 0.08} ${h * 0.1 + 54} H${w * 0.32}`} stroke="#8DB6C9" strokeWidth="6" />
      <rect x={w * 0.08} y={h * 0.1} width={w * 0.24} height={h * 0.34} fill="none" stroke={P.woodDark} strokeWidth="5" />
      <rect x={w * 0.5} y={h * 0.12} width={w * 0.14} height={h * 0.2} fill={P.cream} stroke={P.woodDark} strokeWidth="5" /><path d={`M${w * 0.53} ${h * 0.18} h${w * 0.08} M${w * 0.53} ${h * 0.23} h${w * 0.05}`} stroke={P.stoneDark} strokeWidth="3" />
      <rect x={w * 0.74} y={h * 0.08} width={w * 0.2} height={h * 0.46} fill={P.woodDark} />{[0.12, 0.24, 0.36].map((y, i) => <rect key={i} x={w * 0.75} y={h * y} width={w * 0.18} height={h * 0.1} fill="#8A6540" stroke="#5A3F26" />)}
      <rect x={w * 0.04} y={h * 0.62} width={w * 0.92} height={h * 0.1} fill={P.wood} /><rect x={w * 0.04} y={h * 0.62} width={w * 0.92} height="6" fill={P.woodDark} opacity=".5" />
    </g>
  ),
}

/** Wide-canvas spots (x, ground-y as fractions; s = glyph size in px at 800 wide). Kinds without a spot fall back to the grid. */
const SPOTS: Record<MarketSceneId, Partial<Record<MarketEntityKind, Spot>>> = {
  entrance: { shop: { x: 0.16, by: 0.58, s: 120 }, seller: { x: 0.33, by: 0.8, s: 110 }, customer: { x: 0.66, by: 0.82, s: 110 }, shelf: { x: 0.84, by: 0.58, s: 120 }, basket: { x: 0.5, by: 0.92, s: 92 }, tag: { x: 0.5, by: 0.7, s: 84 } },
  shop: { shelf: { x: 0.08, by: 0.62, s: 112 }, ledger: { x: 0.2, by: 0.62, s: 92 }, seller: { x: 0.33, by: 0.64, s: 118 }, book: { x: 0.46, by: 0.62, s: 96 }, pen: { x: 0.57, by: 0.62, s: 96 }, watch: { x: 0.67, by: 0.62, s: 96 }, card: { x: 0.77, by: 0.62, s: 96 }, bag: { x: 0.88, by: 0.62, s: 96 }, scale: { x: 0.36, by: 0.9, s: 96 }, customer: { x: 0.66, by: 0.94, s: 110 }, tag: { x: 0.5, by: 0.9, s: 84 }, basket: { x: 0.8, by: 0.94, s: 96 } },
  produce: { apple: { x: 0.5, by: 0.58, s: 100 }, scale: { x: 0.2, by: 0.92, s: 104 }, seller: { x: 0.72, by: 0.9, s: 120 }, basket: { x: 0.35, by: 0.58, s: 100 }, tag: { x: 0.62, by: 0.58, s: 92 }, bag: { x: 0.82, by: 0.58, s: 96 }, customer: { x: 0.12, by: 0.58, s: 110 }, riyal: { x: 0.9, by: 0.92, s: 70 } },
  textile: { shirt: { x: 0.28, by: 0.6, s: 110 }, tag: { x: 0.48, by: 0.62, s: 92 }, seller: { x: 0.74, by: 0.88, s: 120 }, bag: { x: 0.56, by: 0.9, s: 100 }, package: { x: 0.36, by: 0.9, s: 104 }, customer: { x: 0.14, by: 0.9, s: 110 }, basket: { x: 0.88, by: 0.62, s: 96 } },
  storage: { package: { x: 0.2, by: 0.62, s: 110 }, shelf: { x: 0.8, by: 0.62, s: 120 }, scale: { x: 0.5, by: 0.9, s: 104 }, receipt: { x: 0.36, by: 0.92, s: 90 }, seller: { x: 0.66, by: 0.92, s: 120 }, bag: { x: 0.1, by: 0.92, s: 100 }, book: { x: 0.58, by: 0.62, s: 96 }, basket: { x: 0.9, by: 0.92, s: 100 } },
  office: { ledger: { x: 0.46, by: 0.7, s: 110 }, receipt: { x: 0.62, by: 0.7, s: 96 }, seller: { x: 0.24, by: 0.94, s: 124 }, riyal: { x: 0.34, by: 0.7, s: 72 }, card: { x: 0.76, by: 0.7, s: 96 }, scale: { x: 0.88, by: 0.7, s: 100 }, tag: { x: 0.58, by: 0.94, s: 90 }, package: { x: 0.76, by: 0.94, s: 104 } },
}
const ALL: MarketEntityKind[] = ['book', 'pen', 'shirt', 'watch', 'apple', 'card', 'seller', 'customer', 'shop', 'basket', 'bag', 'shelf', 'scale', 'package', 'ledger', 'receipt', 'riyal', 'tag']
const isMarketKind = (k: EntityKind): k is MarketEntityKind => (ALL as readonly string[]).includes(k)

function layout(kinds: MarketEntityKind[], scene: MarketSceneId, narrow: boolean) {
  if (!narrow) {
    const W = 800, H = 460
    const grid = (i: number, n: number) => ({ cx: (W * (i + 0.5)) / n, by: H * 0.94, s: 96 })
    const spots = SPOTS[scene]
    const loose = kinds.filter((k) => !spots[k])
    return { W, H, items: kinds.map((k) => { const s = spots[k]; return s ? { kind: k, cx: s.x * W, by: s.by * H, s: s.s } : { kind: k, ...grid(loose.indexOf(k), loose.length) } }) }
  }
  const W = 400
  const cols = kinds.length <= 3 ? Math.max(kinds.length, 1) : kinds.length <= 6 ? 3 : 4
  const rows = Math.max(1, Math.ceil(kinds.length / cols))
  const cell = W / cols
  const s = Math.min(112, cell * 0.82)
  const H = Math.max(300, 130 + rows * (s + 38))
  return { W, H, items: kinds.map((k, i) => ({ kind: k, cx: cell * ((i % cols) + 0.5), by: 120 + (Math.floor(i / cols) + 1) * (s + 38) - 22, s })) }
}

export function MarketScene({ entities, marks = {}, labeled = [], onSelect, disabled, ariaLabelFor, variant }: SceneProps) {
  const narrow = useNarrow()
  const scene: MarketSceneId = isMarketScene(variant) ? variant : 'shop'
  const kinds = (entities ? entities.filter(isMarketKind) : Object.keys(SPOTS[scene]) as MarketEntityKind[])
  const { W, H, items } = layout(kinds, scene, narrow)
  const Back = BACKGROUNDS[scene]
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full overflow-hidden rounded-md border border-ink-600" role="group" aria-label={`Pemandangan pasar: ${SCENE_LABEL[scene]}`}>
      <Back w={W} h={H} />
      {items.map((p, idx) => (
        <SceneHotspot key={p.kind} kind={p.kind} cx={p.cx} by={p.by} s={p.s} mark={marks[p.kind]} label={ariaLabelFor ? ariaLabelFor(p.kind, idx) : `Objek ${idx + 1}`}
          disabled={disabled} showLabel={labeled.includes(p.kind)} onSelect={onSelect} />
      ))}
    </svg>
  )
}

export const SCENE_LABEL: Record<MarketSceneId, string> = {
  entrance: 'gerbang pasar', shop: 'toko kelontong', produce: 'lapak buah', textile: 'lapak kain dan pakaian', storage: 'gudang belakang', office: 'kantor pedagang',
}
