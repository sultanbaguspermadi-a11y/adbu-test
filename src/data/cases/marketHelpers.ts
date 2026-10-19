import { MARKET_ADJECTIVES, MARKET_COUNTABLES, countedNounOf } from '../vocabulary'
import type { ChoiceOption, ChoiceTask, Clue, EntityKind, LexiconId, MarketEntityKind } from '../../types'
import { adjectiveFor, definiteAdjective, mismatchedAdjective } from '../../utils/agreement'
import { countedPhrase } from '../../utils/numerals'
import type { NumeralValue, PhraseOptions } from '../../utils/numerals'

/** Authoring helpers for the Market campaign. Counted phrases and adjective phrases are generated, never hand-typed. */

const entry = (id: MarketEntityKind) => {
  const e = MARKET_COUNTABLES.find((c) => c.id === id)
  if (!e) throw new Error(`Market noun "${id}" is not countable`)
  return e
}
export const sing = (id: MarketEntityKind) => entry(id).ar
export const gender = (id: MarketEntityKind) => entry(id).grammar.gender
/** ثَلَاثَةُ كُتُبٍ, سَاعَتَانِ اثْنَتَانِ … */
export const count = (n: NumeralValue, id: MarketEntityKind, opts?: PhraseOptions) => countedPhrase(n, countedNounOf(id), opts)
/** Wrong-polarity / wrong-agreement version of the same phrase. */
export const forged = (n: NumeralValue, id: MarketEntityKind, opts?: PhraseOptions) => count(n, id, { ...opts, wrong: true })
/** ثَلَاثَةُ رِيَالَاتٍ (riyal is masculine, so 3–10 are always the marked form). */
export const riyals = (n: NumeralValue, opts?: PhraseOptions) => count(n, 'riyal', opts)
export const riyalsWrong = (n: NumeralValue, opts?: PhraseOptions) => forged(n, 'riyal', opts)

const adj = (id: LexiconId) => {
  const a = MARKET_ADJECTIVES.find((x) => x.id === id)?.adj
  if (!a) throw new Error(`"${id}" is not an adjective`)
  return a
}
/** قَمِيصٌ أَحْمَرُ */
export const described = (noun: MarketEntityKind, a: LexiconId) => `${sing(noun)} ${adjectiveFor(adj(a), gender(noun))}`
/** قَمِيصٌ حَمْرَاءُ (agreement error) */
export const describedWrong = (noun: MarketEntityKind, a: LexiconId) => `${sing(noun)} ${mismatchedAdjective(adj(a), gender(noun))}`
/** الْقَمِيصُ الْأَحْمَرُ */
export const definiteDescribed = (nounDefinite: string, noun: MarketEntityKind, a: LexiconId) => `${nounDefinite} ${definiteAdjective(adj(a), gender(noun))}`
/** The adjective alone, agreeing with the noun's gender. */
export const adjFor = (noun: MarketEntityKind, a: LexiconId) => adjectiveFor(adj(a), gender(noun))
export const adjWrongFor = (noun: MarketEntityKind, a: LexiconId) => mismatchedAdjective(adj(a), gender(noun))

export interface Wrong { ar: string; note: string }
/** Builds the options of a ChoiceTask with the correct answer at a chosen position (so it is not always first). */
export function choiceOf(correct: string, wrongs: Wrong[], correctAt = 0): Pick<ChoiceTask, 'options' | 'correct' | 'wrongNotes'> {
  const list: { ar: string; note?: string; ok?: boolean }[] = wrongs.map((w) => ({ ...w }))
  list.splice(Math.min(correctAt, list.length), 0, { ar: correct, ok: true })
  const options: ChoiceOption[] = list.map((o, i) => ({ id: `o${i + 1}`, ar: o.ar }))
  const wrongNotes: Record<string, string> = {}
  list.forEach((o, i) => { if (!o.ok) wrongNotes[`o${i + 1}`] = o.note! })
  return { options, correct: options[list.findIndex((o) => o.ok)].id, wrongNotes }
}

export const clue = (
  id: string, ar: string, note: string, entity: EntityKind, vocab: LexiconId[], isEvidence = true, speaker?: EntityKind,
): Clue => ({ id, ar, note, entity, vocab, isEvidence, ...(speaker ? { speaker } : {}) })

/** Rule reminders reused in feedback. */
export const RULE_AGREE = 'Angka **1** dan **2** diletakkan SETELAH benda dan mengikuti jenisnya (maskulin / feminin).'
export const RULE_POLARITY = 'Untuk **3–10**, angka diletakkan SEBELUM benda dan jenisnya BERLAWANAN: benda maskulin → angka bertā\' marbūṭa (ة), benda feminin → angka tanpa ة. Bendanya jamak.'

/** Agreement error in a definite phrase: الْقَمِيصُ الزَّرْقَاءُ */
export const definiteDescribedWrong = (nounDefinite: string, noun: MarketEntityKind, a: LexiconId) => {
  const wrong = adjWrongFor(noun, a)
  return `${nounDefinite} الْ${wrong.replace(/ٌ$/, 'ُ')}`
}
