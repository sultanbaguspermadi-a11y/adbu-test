/**
 * Arabic ʿadad–maʿdūd numerals 1–10, nominative or genitive (after a preposition such as بِ). Pure grammar; no UI or theme knowledge.
 *
 * Terminology used throughout (to avoid the classic masculine/feminine confusion):
 *   - `unmarked` = the form WITHOUT tāʾ marbūṭa (ثَلَاثُ, وَاحِدٌ, اثْنَانِ) — the grammatically masculine-looking form.
 *   - `marked`   = the form WITH the feminine marking (ثَلَاثَةُ, وَاحِدَةٌ, اثْنَتَانِ).
 *
 * Two different rules apply:
 *   - 1–2  `agreement`: the numeral follows the counted noun like an adjective and agrees with its gender
 *          (masculine noun → unmarked, feminine noun → marked).
 *   - 3–10 `polarity`:  the numeral precedes the counted noun and takes the OPPOSITE gender marking
 *          (masculine noun → marked, feminine noun → unmarked); the noun is plural and genitive.
 *
 * Out of scope on purpose: 11 and above, tens, hundreds, tamyīz, and the accusative case.
 */

export type ArabicGender = 'm' | 'f'
export type NumeralValue = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
export type NumeralRule = 'agreement' | 'polarity'
/** Nominative is the default (subject/predicate); genitive follows a preposition, e.g. بِخَمْسَةِ رِيَالَاتٍ. */
export type NumeralCase = 'nominative' | 'genitive'
export interface PhraseOptions { wrong?: boolean; case?: NumeralCase }

export interface NumeralForms {
  readonly value: NumeralValue
  readonly rule: NumeralRule
  /** Form without tāʾ marbūṭa. */
  readonly unmarked: string
  /** Form with feminine marking. */
  readonly marked: string
}

/** Grammatical facts about a noun that counting needs. */
export interface NounGrammar {
  /** Gender of the SINGULAR noun. Polarity is judged by the singular, even for irrational plurals. */
  readonly gender: ArabicGender
  /** Plural in the genitive case, e.g. كُتُبٍ. */
  readonly pluralGenitive: string
  /** Nominative dual, e.g. كِتَابَانِ. Required only to build the phrase for 2. */
  readonly dual?: string
}

export interface CountedNoun extends NounGrammar {
  /** Indefinite nominative singular, e.g. كِتَابٌ. */
  readonly singular: string
}

export const NUMERAL_VALUES: readonly NumeralValue[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

const FORMS: Readonly<Record<NumeralValue, NumeralForms>> = {
  1: { value: 1, rule: 'agreement', unmarked: 'وَاحِدٌ', marked: 'وَاحِدَةٌ' },
  2: { value: 2, rule: 'agreement', unmarked: 'اثْنَانِ', marked: 'اثْنَتَانِ' },
  3: { value: 3, rule: 'polarity', unmarked: 'ثَلَاثُ', marked: 'ثَلَاثَةُ' },
  4: { value: 4, rule: 'polarity', unmarked: 'أَرْبَعُ', marked: 'أَرْبَعَةُ' },
  5: { value: 5, rule: 'polarity', unmarked: 'خَمْسُ', marked: 'خَمْسَةُ' },
  6: { value: 6, rule: 'polarity', unmarked: 'سِتُّ', marked: 'سِتَّةُ' },
  7: { value: 7, rule: 'polarity', unmarked: 'سَبْعُ', marked: 'سَبْعَةُ' },
  8: { value: 8, rule: 'polarity', unmarked: 'ثَمَانِي', marked: 'ثَمَانِيَةُ' },
  9: { value: 9, rule: 'polarity', unmarked: 'تِسْعُ', marked: 'تِسْعَةُ' },
  10: { value: 10, rule: 'polarity', unmarked: 'عَشْرُ', marked: 'عَشَرَةُ' },
}

/** Nominative → genitive for a numeral form: 1 takes tanwin kasra, 2 the oblique dual, 3–10 a final kasra (8 is invariant). */
function genitiveOf(value: NumeralValue, form: string): string {
  if (value === 1) return form.replace(/ٌ$/, 'ٍ')
  if (value === 2) return form.replace(/انِ$/, 'يْنِ').replace(/َانِ$/, 'َيْنِ')
  // damma → kasra at the end of the word, also when a shadda follows or precedes it (سِتُّ → سِتِّ)
  return form.replace(/\u064F\u0651$/, '\u0650\u0651').replace(/\u0651\u064F$/, '\u0651\u0650').replace(/\u064F$/, '\u0650')
}
const genitiveSingular = (noun: string) => noun.replace(/ٌ$/, 'ٍ')
const genitiveDual = (dual: string) => dual.replace(/َانِ$/, 'َيْنِ')

export function isNumeralValue(n: number): n is NumeralValue {
  return Number.isInteger(n) && n >= 1 && n <= 10
}

function assertValue(value: number): asserts value is NumeralValue {
  if (!isNumeralValue(value)) throw new RangeError(`Numeral helper supports whole numbers 1–10, got ${String(value)}`)
}

export function numeralForms(value: number): NumeralForms {
  assertValue(value)
  return FORMS[value]
}

export function numeralRule(value: number): NumeralRule {
  return numeralForms(value).rule
}

/** Which of the two forms the counted noun requires: agreement for 1–2, polarity for 3–10. */
function requiresMarked(rule: NumeralRule, nounGender: ArabicGender): boolean {
  const nounIsFeminine = nounGender === 'f'
  return rule === 'agreement' ? nounIsFeminine : !nounIsFeminine
}

/** The grammatically correct numeral form for a counted noun of the given gender. */
export function numeralForCountedNoun(value: number, nounGender: ArabicGender, grammaticalCase: NumeralCase = 'nominative'): string {
  const f = numeralForms(value)
  const form = requiresMarked(f.rule, nounGender) ? f.marked : f.unmarked
  return grammaticalCase === 'genitive' ? genitiveOf(f.value, form) : form
}

/** The other (valid-looking but wrong) form: what a careless writer or a forger would produce. */
export function incorrectNumeralForCountedNoun(value: number, nounGender: ArabicGender, grammaticalCase: NumeralCase = 'nominative'): string {
  const f = numeralForms(value)
  const form = requiresMarked(f.rule, nounGender) ? f.unmarked : f.marked
  return grammaticalCase === 'genitive' ? genitiveOf(f.value, form) : form
}

export function isCorrectNumeral(value: number, nounGender: ArabicGender, candidate: string): boolean {
  return candidate.trim() === numeralForCountedNoun(value, nounGender)
}

export interface CountedPhraseParts {
  readonly numeral: string
  /** The noun exactly as it must appear in the phrase (singular for 1, dual for 2, plural genitive for 3–10). */
  readonly noun: string
  /** 1–2 follow the noun; 3–10 precede it. */
  readonly numeralFirst: boolean
}

export function countedPhraseParts(value: number, noun: CountedNoun, opts: PhraseOptions = {}): CountedPhraseParts {
  const rule = numeralRule(value)
  const gc = opts.case ?? 'nominative'
  const numeral = opts.wrong ? incorrectNumeralForCountedNoun(value, noun.gender, gc) : numeralForCountedNoun(value, noun.gender, gc)
  if (rule === 'polarity') return { numeral, noun: noun.pluralGenitive, numeralFirst: true }
  if (value === 1) return { numeral, noun: gc === 'genitive' ? genitiveSingular(noun.singular) : noun.singular, numeralFirst: false }
  if (!noun.dual) throw new RangeError(`A dual form is required to build the phrase for 2 (${noun.singular})`)
  return { numeral, noun: gc === 'genitive' ? genitiveDual(noun.dual) : noun.dual, numeralFirst: false }
}

/** Full phrase, e.g. ثَلَاثَةُ ضُبَّاطٍ, كِتَابٌ وَاحِدٌ; genitive: بِ + ثَلَاثَةِ ضُبَّاطٍ. Pass `wrong: true` for the forged variant. */
export function countedPhrase(value: number, noun: CountedNoun, opts: PhraseOptions = {}): string {
  const p = countedPhraseParts(value, noun, opts)
  return p.numeralFirst ? `${p.numeral} ${p.noun}` : `${p.noun} ${p.numeral}`
}
