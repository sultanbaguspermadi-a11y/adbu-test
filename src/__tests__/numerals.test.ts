import { describe, expect, it } from 'vitest'
import {
  NUMERAL_VALUES, countedPhrase, countedPhraseParts, incorrectNumeralForCountedNoun, isCorrectNumeral,
  isNumeralValue, numeralForCountedNoun, numeralForms, numeralRule,
} from '../utils/numerals'
import type { CountedNoun } from '../utils/numerals'

const officer: CountedNoun = { singular: 'ضَابِطٌ', gender: 'm', dual: 'ضَابِطَانِ', pluralGenitive: 'ضُبَّاطٍ' }
const crane: CountedNoun = { singular: 'رَافِعَةٌ', gender: 'f', dual: 'رَافِعَتَانِ', pluralGenitive: 'رَافِعَاتٍ' }
const book: CountedNoun = { singular: 'كِتَابٌ', gender: 'm', dual: 'كِتَابَانِ', pluralGenitive: 'كُتُبٍ' }
const watch: CountedNoun = { singular: 'سَاعَةٌ', gender: 'f', dual: 'سَاعَتَانِ', pluralGenitive: 'سَاعَاتٍ' }

describe('rule selection', () => {
  it('1–2 use agreement and 3–10 use polarity', () => {
    expect(NUMERAL_VALUES.filter((v) => numeralRule(v) === 'agreement')).toEqual([1, 2])
    expect(NUMERAL_VALUES.filter((v) => numeralRule(v) === 'polarity')).toEqual([3, 4, 5, 6, 7, 8, 9, 10])
  })
  it('covers exactly 1–10', () => {
    expect(NUMERAL_VALUES).toHaveLength(10)
    expect(isNumeralValue(0)).toBe(false)
    expect(isNumeralValue(11)).toBe(false)
    expect(isNumeralValue(2.5)).toBe(false)
  })
})

describe('1–2: agreement with the counted noun', () => {
  it('1 follows the noun and agrees in gender', () => {
    expect(numeralForCountedNoun(1, 'm')).toBe('وَاحِدٌ')
    expect(numeralForCountedNoun(1, 'f')).toBe('وَاحِدَةٌ')
    expect(countedPhrase(1, book)).toBe('كِتَابٌ وَاحِدٌ')
    expect(countedPhrase(1, crane)).toBe('رَافِعَةٌ وَاحِدَةٌ')
  })
  it('2 follows the dual noun and agrees in gender', () => {
    expect(numeralForCountedNoun(2, 'm')).toBe('اثْنَانِ')
    expect(numeralForCountedNoun(2, 'f')).toBe('اثْنَتَانِ')
    expect(countedPhrase(2, book)).toBe('كِتَابَانِ اثْنَانِ')
    expect(countedPhrase(2, watch)).toBe('سَاعَتَانِ اثْنَتَانِ')
  })
  it('numeral comes after the noun, not before', () => {
    expect(countedPhraseParts(1, book).numeralFirst).toBe(false)
    expect(countedPhraseParts(2, book).numeralFirst).toBe(false)
  })
  it('2 needs a dual form', () => {
    const noDual: CountedNoun = { singular: 'قَلَمٌ', gender: 'm', pluralGenitive: 'أَقْلَامٍ' }
    expect(() => countedPhrase(2, noDual)).toThrow(RangeError)
    expect(countedPhrase(1, noDual)).toBe('قَلَمٌ وَاحِدٌ')
  })
})

describe('3–10: gender polarity', () => {
  it('masculine noun → marked form (with tāʾ marbūṭa); feminine noun → unmarked form', () => {
    expect(numeralForCountedNoun(3, 'm')).toBe('ثَلَاثَةُ')
    expect(numeralForCountedNoun(3, 'f')).toBe('ثَلَاثُ')
    expect(numeralForCountedNoun(5, 'm')).toBe('خَمْسَةُ')
    expect(numeralForCountedNoun(5, 'f')).toBe('خَمْسُ')
  })
  it('builds numeral-first phrases with a plural genitive noun', () => {
    expect(countedPhrase(3, officer)).toBe('ثَلَاثَةُ ضُبَّاطٍ')
    expect(countedPhrase(3, crane)).toBe('ثَلَاثُ رَافِعَاتٍ')
    expect(countedPhrase(5, officer)).toBe('خَمْسَةُ ضُبَّاطٍ')
    expect(countedPhrase(5, crane)).toBe('خَمْسُ رَافِعَاتٍ')
    expect(countedPhraseParts(7, crane).numeralFirst).toBe(true)
  })
  it.each([3, 4, 5, 6, 7, 8, 9, 10])('%i: the marked form carries ة and the unmarked form does not', (v) => {
    const f = numeralForms(v)
    expect(f.marked).toContain('ة')
    expect(f.unmarked).not.toContain('ة')
    expect(numeralForCountedNoun(v, 'm')).toBe(f.marked)
    expect(numeralForCountedNoun(v, 'f')).toBe(f.unmarked)
  })
  it('irregular forms of 6, 8 and 10 are as expected', () => {
    expect(numeralForCountedNoun(6, 'f')).toBe('سِتُّ')
    expect(numeralForCountedNoun(8, 'f')).toBe('ثَمَانِي')
    expect(numeralForCountedNoun(8, 'm')).toBe('ثَمَانِيَةُ')
    expect(numeralForCountedNoun(10, 'f')).toBe('عَشْرُ')
    expect(numeralForCountedNoun(10, 'm')).toBe('عَشَرَةُ')
  })
})

describe('forged / incorrect forms', () => {
  it.each(NUMERAL_VALUES)('the incorrect form for %i differs from the correct one for both genders', (v) => {
    for (const g of ['m', 'f'] as const) {
      expect(incorrectNumeralForCountedNoun(v, g)).not.toBe(numeralForCountedNoun(v, g))
      expect(isCorrectNumeral(v, g, numeralForCountedNoun(v, g))).toBe(true)
      expect(isCorrectNumeral(v, g, incorrectNumeralForCountedNoun(v, g))).toBe(false)
    }
  })
  it('a forged phrase swaps only the numeral', () => {
    expect(countedPhrase(3, crane, { wrong: true })).toBe('ثَلَاثَةُ رَافِعَاتٍ')
    expect(countedPhrase(4, officer, { wrong: true })).toBe('أَرْبَعُ ضُبَّاطٍ')
    expect(countedPhrase(1, book, { wrong: true })).toBe('كِتَابٌ وَاحِدَةٌ')
  })
})

describe('input validation', () => {
  it.each([0, 11, -1, 2.5, Number.NaN])('rejects %s', (bad) => {
    expect(() => numeralForCountedNoun(bad, 'm')).toThrow(RangeError)
    expect(() => numeralForms(bad)).toThrow(RangeError)
    expect(() => countedPhrase(bad, book)).toThrow(RangeError)
  })
})

describe('genitive (after a preposition such as بِ)', () => {
  it('3–10 take a final kasra and keep polarity', () => {
    expect(numeralForCountedNoun(3, 'm', 'genitive')).toBe('ثَلَاثَةِ')
    expect(numeralForCountedNoun(3, 'f', 'genitive')).toBe('ثَلَاثِ')
    expect(numeralForCountedNoun(6, 'f', 'genitive')).toBe('سِتِّ')
    expect(numeralForCountedNoun(10, 'm', 'genitive')).toBe('عَشَرَةِ')
    expect(countedPhrase(5, officer, { case: 'genitive' })).toBe('خَمْسَةِ ضُبَّاطٍ')
    expect(countedPhrase(5, crane, { case: 'genitive' })).toBe('خَمْسِ رَافِعَاتٍ')
  })
  it('8 is invariant', () => {
    expect(numeralForCountedNoun(8, 'f', 'genitive')).toBe('ثَمَانِي')
    expect(numeralForCountedNoun(8, 'm', 'genitive')).toBe('ثَمَانِيَةِ')
  })
  it('1 and 2 use genitive noun and oblique numeral', () => {
    expect(countedPhrase(1, book, { case: 'genitive' })).toBe('كِتَابٍ وَاحِدٍ')
    expect(countedPhrase(1, watch, { case: 'genitive' })).toBe('سَاعَةٍ وَاحِدَةٍ')
    expect(countedPhrase(2, book, { case: 'genitive' })).toBe('كِتَابَيْنِ اثْنَيْنِ')
    expect(countedPhrase(2, watch, { case: 'genitive' })).toBe('سَاعَتَيْنِ اثْنَتَيْنِ')
  })
  it('forged genitive phrases still swap only the polarity', () => {
    expect(countedPhrase(4, crane, { case: 'genitive', wrong: true })).toBe('أَرْبَعَةِ رَافِعَاتٍ')
  })
})
