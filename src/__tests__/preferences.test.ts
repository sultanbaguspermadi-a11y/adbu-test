import themeCss from '../styles/theme.css?raw'
import paletteCss from '../styles/palette.css?raw'
import indexCss from '../styles/index.css?raw'
import { beforeEach, describe, expect, it } from 'vitest'
import { applyPreferences, attributesFor, resolveMotion, resolveTheme } from '../theme/apply'
import { ATTR_NAMES, DEFAULT_PREFERENCES, ENUMS, sanitizePreferences } from '../theme/preferences'
import type { EnumKey } from '../theme/preferences'
import { loadPreferences, PREFS_KEY, usePreferencesStore } from '../stores/preferencesStore'
import { usePlayerStore } from '../stores/playerStore'

const css = [themeCss, paletteCss, indexCss].join('\n')
const env = (over = {}) => ({ systemDark: true, systemReducedMotion: false, ...over })

beforeEach(() => { localStorage.clear(); usePreferencesStore.getState().resetPrefs(); usePlayerStore.getState().resetAll() })

describe('sanitizePreferences', () => {
  it('returns defaults for anything that is not an object', () => {
    for (const bad of [null, undefined, 'x', 7, [], true]) expect(sanitizePreferences(bad)).toEqual(DEFAULT_PREFERENCES)
  })
  it('falls back per key: valid values survive, invalid ones do not poison the rest', () => {
    const p = sanitizePreferences({ theme: 'neon', accent: 'crimson', uiSize: 99, highContrast: 'yes', paperGrain: false, extra: 1 })
    expect(p.theme).toBe('dark')
    expect(p.accent).toBe('crimson')
    expect(p.uiSize).toBe('default')
    expect(p.highContrast).toBe(false)
    expect(p.paperGrain).toBe(false)
    expect('extra' in p).toBe(false)
  })
})

describe('attributesFor', () => {
  it('default preferences produce the default look', () => {
    const a = attributesFor(DEFAULT_PREFERENCES, env())
    expect(a).toMatchObject({ 'data-theme': 'dark', 'data-accent': 'gold', 'data-radius': 'rounded', 'data-density': 'comfortable', 'data-motion': 'full', 'data-contrast': 'normal', 'data-transparency': 'normal' })
  })
  it('theme "system" follows the OS, an explicit theme ignores it', () => {
    const sys = { ...DEFAULT_PREFERENCES, theme: 'system' as const }
    expect(resolveTheme(sys, env({ systemDark: false }))).toBe('light')
    expect(resolveTheme(sys, env({ systemDark: true }))).toBe('dark')
    expect(resolveTheme({ ...sys, theme: 'dark' }, env({ systemDark: false }))).toBe('dark')
  })
  it('motion "system" respects prefers-reduced-motion, an explicit choice always wins', () => {
    const reduce = env({ systemReducedMotion: true })
    expect(resolveMotion(DEFAULT_PREFERENCES, reduce)).toBe('reduced')
    expect(resolveMotion({ ...DEFAULT_PREFERENCES, motion: 'full' }, reduce)).toBe('full')
    expect(resolveMotion({ ...DEFAULT_PREFERENCES, motion: 'none' }, env())).toBe('none')
  })
  it('boolean preferences map to their attributes', () => {
    const a = attributesFor({ ...DEFAULT_PREFERENCES, highContrast: true, strongFocus: true, readability: true, reduceTransparency: true, paperGrain: false, backgroundGrid: false, decorativeMotion: false }, env())
    expect(a).toMatchObject({ 'data-contrast': 'high', 'data-focus': 'strong', 'data-readable': 'on', 'data-transparency': 'reduced', 'data-grain': 'off', 'data-grid': 'off', 'data-decor': 'off' })
  })
  it('applyPreferences writes the attributes and the theme-color meta', () => {
    document.head.innerHTML = '<meta name="theme-color" content="#000">'
    applyPreferences({ ...DEFAULT_PREFERENCES, theme: 'light', accent: 'blue' }, env(), document.documentElement)
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
    expect(document.documentElement.getAttribute('data-accent')).toBe('blue')
    expect(document.querySelector('meta[name="theme-color"]')!.getAttribute('content')).toBe('#E8E2D2')
  })
})

describe('stylesheet contract: every option the UI can set has a CSS rule', () => {
  const resolvedElsewhere = new Set(['theme:dark', 'theme:system', 'motion:system', 'motion:full']) // handled by the default tokens / JS resolution
  const accentGoldDefault = 'accent:gold'
  for (const key of Object.keys(ENUMS) as EnumKey[]) {
    for (const value of ENUMS[key]) {
      const id = `${key}:${value}`
      if (resolvedElsewhere.has(id) || value === (DEFAULT_PREFERENCES as unknown as Record<string, string>)[key] && id !== accentGoldDefault) continue
      it(`${ATTR_NAMES[key]}='${value}' is styled`, () => { expect(css).toContain(`[${ATTR_NAMES[key]}='${value}']`) })
    }
  }
  for (const sel of ["data-decor='off'", "data-grain='off'", "data-grid='off'", "data-contrast='high'", "data-focus='strong'", "data-readable='on'", "data-transparency='reduced'"]) {
    it(`[${sel}] is styled`, () => { expect(css).toContain(`[${sel}]`) })
  }
  it('every accent has a light-theme variant (light-desk text shades differ)', () => {
    for (const a of ENUMS.accent.filter((x) => x !== 'gold')) expect(css).toContain(`[data-accent='${a}'][data-theme='light']`)
  })
})

describe('preferencesStore', () => {
  it('persists changes and reloads them', () => {
    usePreferencesStore.getState().setPrefs({ theme: 'light', uiSize: 'large' })
    expect(JSON.parse(localStorage.getItem(PREFS_KEY)!)).toMatchObject({ theme: 'light', uiSize: 'large' })
    expect(loadPreferences()).toMatchObject({ theme: 'light', uiSize: 'large' })
  })
  it('rejects invalid patches', () => {
    usePreferencesStore.getState().setPrefs({ theme: 'banana' as never })
    expect(usePreferencesStore.getState().prefs.theme).toBe('dark')
  })
  it('survives corrupt storage', () => {
    localStorage.setItem(PREFS_KEY, '{{{ nope')
    expect(loadPreferences()).toEqual(DEFAULT_PREFERENCES)
  })
  it('migrates the legacy reduceMotion switch exactly once (only when no prefs exist yet)', () => {
    localStorage.removeItem(PREFS_KEY) // a genuinely fresh browser has no prefs key yet
    localStorage.setItem('arabic-detective:v1:state', JSON.stringify({ players: {}, settings: { reduceMotion: true } }))
    expect(loadPreferences().motion).toBe('reduced')
    localStorage.setItem(PREFS_KEY, JSON.stringify({ ...DEFAULT_PREFERENCES, motion: 'full' }))
    expect(loadPreferences().motion).toBe('full')
  })
  it('restoring appearance defaults never touches students, progress or gameplay settings', () => {
    const pid = usePlayerStore.getState().createPlayer('Sinta', 'X')
    usePlayerStore.getState().setSettings({ demoUnlock: true })
    const snapshot = JSON.stringify({ players: usePlayerStore.getState().players, settings: usePlayerStore.getState().settings })
    usePreferencesStore.getState().setPrefs({ theme: 'light', accent: 'blue', density: 'compact' })
    usePreferencesStore.getState().resetPrefs()
    expect(usePreferencesStore.getState().prefs).toEqual(DEFAULT_PREFERENCES)
    expect(JSON.stringify({ players: usePlayerStore.getState().players, settings: usePlayerStore.getState().settings })).toBe(snapshot)
    expect(usePlayerStore.getState().players[pid].name).toBe('Sinta')
  })
  it('"delete all student data" keeps appearance preferences', () => {
    usePreferencesStore.getState().setPrefs({ theme: 'light' })
    usePlayerStore.getState().resetAll()
    expect(usePreferencesStore.getState().prefs.theme).toBe('light')
    expect(JSON.parse(localStorage.getItem(PREFS_KEY)!).theme).toBe('light')
  })
})
