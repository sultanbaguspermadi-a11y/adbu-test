import type { CaseDefinition, ThemeId } from '../../types'
import { canonicalCaseId } from '../caseIds'
import { case1 } from './case1'
import { case2 } from './case2'
import { case3 } from './case3'
import { case4 } from './case4'
import { case5 } from './case5'
import { market1 } from './market1'
import { market2 } from './market2'
import { market3 } from './market3'
import { market4 } from './market4'
import { market5 } from './market5'

export const CASES: CaseDefinition[] = [case1, case2, case3, case4, case5, market1, market2, market3, market4, market5]
/** Resolves current and legacy (`case-N`) ids. */
export const getCase = (id: string | undefined): CaseDefinition | undefined => {
  const wanted = id === undefined ? undefined : canonicalCaseId(id)
  return CASES.find((c) => c.id === wanted)
}
export const getClue = (def: CaseDefinition, id: string) => def.clues.find((c) => c.id === id)
export const evidenceTotal = (def: CaseDefinition) => def.clues.filter((c) => c.isEvidence).length
export const clueNumber = (def: CaseDefinition, id: string) => def.clues.findIndex((c) => c.id === id) + 1

/** Cases of one theme in play order. Pass `cases` to reason about hypothetical sets (tests, tooling). */
export const casesOfTheme = (theme: ThemeId, cases: readonly CaseDefinition[] = CASES): CaseDefinition[] =>
  cases.filter((c) => c.theme === theme).sort((a, b) => a.number - b.number)
export const previousCaseInTheme = (def: CaseDefinition, cases: readonly CaseDefinition[] = CASES) =>
  cases.find((c) => c.theme === def.theme && c.number === def.number - 1)
export const nextCaseInTheme = (def: CaseDefinition, cases: readonly CaseDefinition[] = CASES) =>
  cases.find((c) => c.theme === def.theme && c.number === def.number + 1)
