import { ATTR_NAMES, DEFAULT_PREFERENCES, sanitizePreferences } from './preferences'
import type { Preferences } from './preferences'

export interface Environment { systemDark: boolean; systemReducedMotion: boolean }

export function readEnvironment(): Environment {
  const mq = (q: string) => { try { return typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia(q).matches } catch { return false } }
  return { systemDark: !(typeof window !== 'undefined' && typeof window.matchMedia === 'function') || !mq('(prefers-color-scheme: light)'), systemReducedMotion: mq('(prefers-reduced-motion: reduce)') }
}

/** Preference -> the effective motion level. "system" follows the OS; an explicit choice always wins. */
export function resolveMotion(p: Preferences, env: Environment): 'full' | 'reduced' | 'none' {
  return p.motion === 'system' ? (env.systemReducedMotion ? 'reduced' : 'full') : p.motion
}
export function resolveTheme(p: Preferences, env: Environment): 'dark' | 'light' {
  return p.theme === 'system' ? (env.systemDark ? 'dark' : 'light') : p.theme
}

/** Pure: preferences + environment -> the data-* attributes that the stylesheet understands. */
export function attributesFor(p: Preferences, env: Environment): Record<string, string> {
  const a: Record<string, string> = {}
  ;(Object.keys(ATTR_NAMES) as (keyof typeof ATTR_NAMES)[]).forEach((k) => { a[ATTR_NAMES[k]] = String(p[k]) })
  a['data-theme'] = resolveTheme(p, env)
  a['data-motion'] = resolveMotion(p, env)
  a['data-ui-size'] = p.uiSize
  a['data-decor'] = p.decorativeMotion ? 'on' : 'off'
  a['data-grain'] = p.paperGrain ? 'on' : 'off'
  a['data-grid'] = p.backgroundGrid ? 'on' : 'off'
  a['data-contrast'] = p.highContrast ? 'high' : 'normal'
  a['data-focus'] = p.strongFocus ? 'strong' : 'normal'
  a['data-readable'] = p.readability ? 'on' : 'off'
  a['data-transparency'] = p.reduceTransparency ? 'reduced' : 'normal'
  return a
}

const THEME_COLOR = { dark: '#0B1B2E', light: '#E8E2D2' }

export function applyPreferences(p: Preferences = DEFAULT_PREFERENCES, env: Environment = readEnvironment(), root: HTMLElement = document.documentElement): void {
  const attrs = attributesFor(sanitizePreferences(p), env)
  for (const [k, v] of Object.entries(attrs)) if (root.getAttribute(k) !== v) root.setAttribute(k, v)
  const meta = root.ownerDocument.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', THEME_COLOR[attrs['data-theme'] as 'dark' | 'light'])
}
