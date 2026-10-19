import { useEffect, useState } from 'react'
import { usePreferencesStore } from '../stores/preferencesStore'
import { applyPreferences, readEnvironment, resolveMotion } from './apply'
import type { Environment } from './apply'

function useEnvironment(): Environment {
  const [env, setEnv] = useState<Environment>(readEnvironment)
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const queries = ['(prefers-color-scheme: light)', '(prefers-reduced-motion: reduce)'].map((q) => window.matchMedia(q))
    const update = () => setEnv(readEnvironment())
    queries.forEach((q) => q.addEventListener?.('change', update))
    return () => queries.forEach((q) => q.removeEventListener?.('change', update))
  }, [])
  return env
}

/** Mount once (App). Applies preferences to <html> whenever they or the OS settings change. */
export function useApplyAppearance() {
  const prefs = usePreferencesStore((s) => s.prefs)
  const env = useEnvironment()
  useEffect(() => { applyPreferences(prefs, env) }, [prefs, env])
}

/** For code that must branch in JS (framer-motion config, decorative SVG animation). Styling never needs this. */
export function useMotion() {
  const prefs = usePreferencesStore((s) => s.prefs)
  const env = useEnvironment()
  const level = resolveMotion(prefs, env)
  return { level, decorative: prefs.decorativeMotion && level === 'full', framer: (prefs.motion === 'system' ? 'user' : level === 'full' ? 'never' : 'always') as 'user' | 'never' | 'always' }
}
