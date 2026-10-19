import type { CaseDefinition, ThemeId, VocabEntry } from '../types'
import type { ThemeDef } from '../themes/registry'

/** Every vocabulary id a case uses (case list, clues, tasks) must belong to its theme or to the shared set. */
export function verifyCaseVocab(def: CaseDefinition, theme: ThemeDef, shared: ReadonlySet<string>): string[] {
  const allowed = new Set<string>([...theme.vocab.map((v) => v.id), ...shared])
  const errors: string[] = []
  const check = (id: string, where: string) => {
    if (!allowed.has(id)) errors.push(`${def.id}: "${id}" used in ${where} is not part of theme "${theme.id}" or the shared vocabulary`)
  }
  def.vocabulary.forEach((id) => check(id, 'case vocabulary'))
  def.clues.forEach((c) => c.vocab.forEach((id) => check(id, `clue ${c.id}`)))
  def.tasks.forEach((t) => t.vocab.forEach((id) => check(id, `task ${t.id}`)))
  return errors
}

/** Case order is per theme: within each theme the numbers must run 1, 2, 3… in array order. */
export function verifyCaseNumbering(cases: readonly CaseDefinition[], themes: Readonly<Record<ThemeId, ThemeDef>>): string[] {
  const errors: string[] = []
  const seen = new Map<string, number>()
  for (const def of cases) {
    if (!Object.prototype.hasOwnProperty.call(themes, def.theme)) {
      errors.push(`${def.id}: unknown theme "${String(def.theme)}"`)
      continue
    }
    const position = (seen.get(def.theme) ?? 0) + 1
    seen.set(def.theme, position)
    if (def.number !== position) errors.push(`${def.id}: invalid case order (number ${def.number} at position ${position} of theme "${def.theme}")`)
  }
  return errors
}

/** Registry integrity: vocabulary ownership is unambiguous and unlock gates point at real cases of another theme. */
export function verifyThemes(
  themes: Readonly<Record<ThemeId, ThemeDef>>,
  shared: ReadonlySet<string>,
  allVocab: readonly VocabEntry[],
  cases: readonly CaseDefinition[],
): string[] {
  const errors: string[] = []
  const owner = new Map<string, ThemeId>()
  const labels = new Map<string, ThemeId>()
  const letters = new Map<string, ThemeId>()

  for (const [key, theme] of Object.entries(themes) as [ThemeId, ThemeDef][]) {
    if (theme.id !== key) errors.push(`theme "${key}" is registered with id "${theme.id}"`)
    for (const v of theme.vocab) {
      const prev = owner.get(v.id)
      if (prev) errors.push(`vocabulary "${v.id}" is owned by both "${prev}" and "${key}"`)
      owner.set(v.id, key)
      if (shared.has(v.id)) errors.push(`vocabulary "${v.id}" in theme "${key}" collides with a shared id`)
    }
    const dupLabel = labels.get(theme.docLabel)
    if (dupLabel) errors.push(`themes "${dupLabel}" and "${key}" share the label "${theme.docLabel}"`)
    labels.set(theme.docLabel, key)
    const dupLetter = letters.get(theme.codeLetter)
    if (dupLetter) errors.push(`themes "${dupLetter}" and "${key}" share the code letter "${theme.codeLetter}"`)
    letters.set(theme.codeLetter, key)

    if (theme.scenes.length === 0) errors.push(`theme "${key}" has no scenes`)
    if (theme.unlockAfterCaseId !== null && cases.length > 0) {
      const gate = cases.find((c) => c.id === theme.unlockAfterCaseId)
      if (!gate) errors.push(`theme "${key}" unlocks after missing case "${theme.unlockAfterCaseId}"`)
      else if (gate.theme === key) errors.push(`theme "${key}" is gated by its own case "${gate.id}"`)
    }
  }
  allVocab.forEach((v) => { if (!owner.has(v.id)) errors.push(`vocabulary "${v.id}" is not owned by any theme`) })
  return errors
}

/** A case or task may only name a scene variant its theme can draw. */
export function verifyCaseScenes(def: CaseDefinition, theme: ThemeDef): string[] {
  const errors: string[] = []
  const check = (scene: string | undefined, where: string) => {
    if (scene !== undefined && !theme.scenes.includes(scene)) errors.push(`${def.id}: scene "${scene}" in ${where} is not a "${theme.id}" scene`)
  }
  check(def.scene, 'case')
  def.tasks.forEach((t) => { if (t.type === 'hotspot' || t.type === 'inspect') check(t.scene, `task ${t.id}`) })
  return errors
}
