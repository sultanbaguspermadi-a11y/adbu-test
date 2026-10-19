import { create } from 'zustand'
import { loadJSON, saveJSON, STATE_KEY } from '../services/persistence/storage'
import { DEFAULT_PREFERENCES, sanitizePreferences } from '../theme/preferences'
import type { Preferences } from '../theme/preferences'

export const PREFS_KEY = 'arabic-detective:v1:prefs'

/** Reads saved preferences. First run after the upgrade: carries over the old "reduce motion" switch that used to live in the player state. */
export function loadPreferences(): Preferences {
  const saved = loadJSON(PREFS_KEY)
  if (saved !== null) return sanitizePreferences(saved)
  const legacy = loadJSON(STATE_KEY) as { settings?: { reduceMotion?: unknown } } | null
  if (legacy?.settings?.reduceMotion === true) return { ...DEFAULT_PREFERENCES, motion: 'reduced' }
  return { ...DEFAULT_PREFERENCES }
}

interface PreferencesState {
  prefs: Preferences
  setPrefs: (patch: Partial<Preferences>) => void
  /** Restores appearance defaults only. Never touches players, progress, achievements or gameplay settings. */
  resetPrefs: () => void
}

export const usePreferencesStore = create<PreferencesState>((set) => ({
  prefs: loadPreferences(),
  setPrefs: (patch) => set((s) => ({ prefs: sanitizePreferences({ ...s.prefs, ...patch }) })),
  resetPrefs: () => set({ prefs: { ...DEFAULT_PREFERENCES } }),
}))

usePreferencesStore.subscribe((s) => saveJSON(PREFS_KEY, s.prefs))

// keep several open tabs in sync
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === PREFS_KEY) usePreferencesStore.setState({ prefs: loadPreferences() })
  })
}
