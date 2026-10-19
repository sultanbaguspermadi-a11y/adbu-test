/**
 * Appearance & accessibility preferences: model, defaults, option metadata and a tolerant sanitizer.
 * Kept separate from gameplay settings (demoUnlock) and from student data on purpose:
 *  - "delete all student data" must not wipe how someone has configured the app,
 *  - a slider change must not re-serialise every student's progress.
 */
export const PREFS_VERSION = 1

export const ENUMS = {
  theme: ['dark', 'light', 'system'],
  accent: ['gold', 'amber', 'emerald', 'blue', 'crimson'],
  radius: ['sharp', 'slight', 'rounded', 'extra'],
  density: ['compact', 'comfortable', 'spacious'],
  contentWidth: ['narrow', 'standard', 'wide'],
  uiFont: ['inter', 'system', 'plex', 'atkinson'],
  uiSize: ['small', 'default', 'large', 'xlarge'],
  uiLeading: ['compact', 'comfortable', 'relaxed'],
  arabicFont: ['naskh', 'amiri', 'scheherazade'],
  arabicSize: ['normal', 'large', 'xlarge'],
  arabicLeading: ['compact', 'comfortable', 'relaxed'],
  arabicAlign: ['auto', 'right', 'center'],
  arabicWeight: ['normal', 'bold'],
  motion: ['system', 'full', 'reduced', 'none'],
} as const

type Enums = typeof ENUMS
export type EnumKey = keyof Enums
export type EnumValue<K extends EnumKey> = Enums[K][number]

export interface Preferences {
  version: typeof PREFS_VERSION
  theme: EnumValue<'theme'>
  accent: EnumValue<'accent'>
  radius: EnumValue<'radius'>
  density: EnumValue<'density'>
  contentWidth: EnumValue<'contentWidth'>
  uiFont: EnumValue<'uiFont'>
  uiSize: EnumValue<'uiSize'>
  uiLeading: EnumValue<'uiLeading'>
  arabicFont: EnumValue<'arabicFont'>
  arabicSize: EnumValue<'arabicSize'>
  arabicLeading: EnumValue<'arabicLeading'>
  arabicAlign: EnumValue<'arabicAlign'>
  arabicWeight: EnumValue<'arabicWeight'>
  motion: EnumValue<'motion'>
  decorativeMotion: boolean
  paperGrain: boolean
  backgroundGrid: boolean
  highContrast: boolean
  strongFocus: boolean
  readability: boolean
  reduceTransparency: boolean
}

/** Defaults reproduce the original look exactly. */
export const DEFAULT_PREFERENCES: Preferences = {
  version: PREFS_VERSION,
  theme: 'dark', accent: 'gold', radius: 'rounded', density: 'comfortable', contentWidth: 'standard',
  uiFont: 'inter', uiSize: 'default', uiLeading: 'comfortable',
  arabicFont: 'naskh', arabicSize: 'normal', arabicLeading: 'comfortable', arabicAlign: 'auto', arabicWeight: 'normal',
  motion: 'system', decorativeMotion: true, paperGrain: true, backgroundGrid: true,
  highContrast: false, strongFocus: false, readability: false, reduceTransparency: false,
}

const isObj = (x: unknown): x is Record<string, unknown> => typeof x === 'object' && x !== null && !Array.isArray(x)
const pickEnum = <K extends EnumKey>(key: K, v: unknown, fallback: EnumValue<K>): EnumValue<K> =>
  (ENUMS[key] as readonly unknown[]).includes(v) ? (v as EnumValue<K>) : fallback
const bool = (v: unknown, d: boolean) => (typeof v === 'boolean' ? v : d)

/** Tolerant loader: unknown keys are dropped, invalid values fall back to the default for that key only. */
export function sanitizePreferences(raw: unknown): Preferences {
  const d = DEFAULT_PREFERENCES
  if (!isObj(raw)) return { ...d }
  const out: Preferences = { ...d }
  ;(Object.keys(ENUMS) as EnumKey[]).forEach((k) => { (out as unknown as Record<string, unknown>)[k] = pickEnum(k, raw[k], d[k] as never) })
  out.decorativeMotion = bool(raw.decorativeMotion, d.decorativeMotion)
  out.paperGrain = bool(raw.paperGrain, d.paperGrain)
  out.backgroundGrid = bool(raw.backgroundGrid, d.backgroundGrid)
  out.highContrast = bool(raw.highContrast, d.highContrast)
  out.strongFocus = bool(raw.strongFocus, d.strongFocus)
  out.readability = bool(raw.readability, d.readability)
  out.reduceTransparency = bool(raw.reduceTransparency, d.reduceTransparency)
  return out
}

/** Which <html> data-attribute each enum preference drives, and the CSS value for each option. Used by apply.ts and by the CSS contract test. */
export const ATTR_NAMES: Record<EnumKey, string> = {
  theme: 'data-theme', accent: 'data-accent', radius: 'data-radius', density: 'data-density', contentWidth: 'data-width',
  uiFont: 'data-ui-font', uiSize: 'data-ui-size', uiLeading: 'data-ui-leading',
  arabicFont: 'data-ar-font', arabicSize: 'data-ar-size', arabicLeading: 'data-ar-leading', arabicAlign: 'data-ar-align', arabicWeight: 'data-ar-weight',
  motion: 'data-motion',
}
