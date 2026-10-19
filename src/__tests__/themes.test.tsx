import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { CASES, casesOfTheme, nextCaseInTheme, previousCaseInTheme } from '../data/cases'
import { glossSentence } from '../data/lexicon'
import { MARKET_COUNTABLES, NUMERALS, PREPS, SHARED_VOCAB_IDS, VOCAB, countedNounOf, getLexeme, labelOf } from '../data/vocabulary'
import { verifyContent } from '../engine/verifyContent'
import { verifyCaseNumbering, verifyCaseVocab, verifyThemes } from '../engine/verifyTheme'
import { defaultSettings, emptyPlayer, sanitizeState } from '../services/persistence/schema'
import { isCaseUnlocked, lockedReason } from '../stores/playerStore'
import { THEME_ORDER, THEMES, caseCode } from '../themes/registry'
import type { ThemeDef } from '../themes/registry'
import { THEME_VIEWS, themeView } from '../themes/views'
import { MarketScene } from '../components/game/MarketScene'
import type { CaseDefinition, CaseProgress, LexiconId, PlayerProfile, ThemeId } from '../types'
import { countedPhrase } from '../utils/numerals'

afterEach(cleanup)

const byId = (id: string) => CASES.find((c) => c.id === id)!
const M1 = byId('market-1')
const M2 = byId('market-2')
const WITH_MARKET: CaseDefinition[] = CASES
/** A throwaway Market-themed case used to exercise numbering errors. */
const market = (n: number): CaseDefinition => ({ ...structuredClone(CASES[0]), id: `market-x${n}`, theme: 'market', number: n })

const done = (p: PlayerProfile, ...ids: string[]) => {
  ids.forEach((id) => {
    const pr: CaseProgress = { caseId: id, completed: true, stars: 3, bestXp: 0, bestAccuracy: 1, bestTimeMs: null, attempts: 1, lastPlayedAt: 0, lastResult: null }
    p.progress[id] = pr
  })
  return p
}
const fresh = () => emptyPlayer('p1', 'Ani', 'XI')

describe('Harbor is unchanged', () => {
  it('has exactly five Harbor cases (numbered 1–5) and five Market cases (numbered 1–5)', () => {
    const harbor = casesOfTheme('harbor')
    expect(harbor).toHaveLength(5)
    expect(harbor.map((c) => c.id)).toEqual(['harbor-1', 'harbor-2', 'harbor-3', 'harbor-4', 'harbor-5'])
    expect(harbor.map((c) => c.number)).toEqual([1, 2, 3, 4, 5])
    const market = casesOfTheme('market')
    expect(market.map((c) => c.id)).toEqual(['market-1', 'market-2', 'market-3', 'market-4', 'market-5'])
    expect(market.map((c) => c.number)).toEqual([1, 2, 3, 4, 5])
    expect(CASES).toHaveLength(10)
  })
  it('passes content verification, including ownership and numbering', () => {
    expect(verifyContent()).toEqual([])
  })
  it('keeps the linear Harbor unlock chain', () => {
    const p = fresh()
    const harbor = casesOfTheme('harbor')
    expect(harbor.map((c) => isCaseUnlocked(p, defaultSettings(), c))).toEqual([true, false, false, false, false])
    done(p, 'harbor-1', 'harbor-2')
    expect(harbor.map((c) => isCaseUnlocked(p, defaultSettings(), c))).toEqual([true, true, true, false, false])
  })
  it('previous/next are scoped to the case theme', () => {
    expect(previousCaseInTheme(CASES[0])).toBeUndefined()
    expect(previousCaseInTheme(CASES[2])?.id).toBe('harbor-2')
    expect(nextCaseInTheme(CASES[4])).toBeUndefined() // harbor-5 is last in its theme even though market cases follow in CASES
    expect(nextCaseInTheme(M1)?.id).toBe('market-2')
  })
})

describe('theme registry', () => {
  it('registers a complete, consistent definition per ThemeId', () => {
    expect([...THEME_ORDER].sort()).toEqual(Object.keys(THEMES).sort())
    expect(Object.keys(THEME_VIEWS).sort()).toEqual(Object.keys(THEMES).sort())
    ;(Object.keys(THEMES) as ThemeId[]).forEach((id) => expect(THEMES[id].id).toBe(id))
    expect(verifyThemes(THEMES, SHARED_VOCAB_IDS, VOCAB, CASES)).toEqual([])
  })
  it('market unlocks after harbor case 2 and harbor is open from the start', () => {
    expect(THEMES.harbor.unlockAfterCaseId).toBeNull()
    expect(THEMES.market.unlockAfterCaseId).toBe('harbor-2')
  })
  it('resolves theme views', () => {
    expect(themeView('harbor').Scene).toBe(THEME_VIEWS.harbor.Scene)
    expect(themeView('market').Scene).not.toBe(themeView('harbor').Scene)
  })
  it('builds per-theme case codes', () => {
    expect(caseCode({ theme: 'harbor', number: 1 })).toBe('AD-H01')
    expect(caseCode(CASES[4])).toBe('AD-H05')
    expect(caseCode({ theme: 'market', number: 3 })).toBe('AD-M03')
  })
  it('flags ownership, collision and gate problems', () => {
    const dup: Record<ThemeId, ThemeDef> = { ...THEMES, market: { ...THEMES.market, vocab: [...THEMES.market.vocab, THEMES.harbor.vocab[0]], codeLetter: 'H' } }
    const errs = verifyThemes(dup, SHARED_VOCAB_IDS, VOCAB, CASES).join('\n')
    expect(errs).toContain('owned by both')
    expect(errs).toContain('share the code letter')
    const badGate: Record<ThemeId, ThemeDef> = { ...THEMES, market: { ...THEMES.market, unlockAfterCaseId: 'harbor-99' } }
    expect(verifyThemes(badGate, SHARED_VOCAB_IDS, VOCAB, CASES).join('\n')).toContain('missing case "harbor-99"')
    const selfGate: Record<ThemeId, ThemeDef> = { ...THEMES, harbor: { ...THEMES.harbor, unlockAfterCaseId: 'harbor-1' } }
    expect(verifyThemes(selfGate, SHARED_VOCAB_IDS, VOCAB, CASES).join('\n')).toContain('gated by its own case')
    const orphan = { id: 'orphan' as never, ar: 'x', idn: 'x', cue: 'x' }
    expect(verifyThemes(THEMES, SHARED_VOCAB_IDS, [...VOCAB, orphan], CASES).join('\n')).toContain('"orphan" is not owned by any theme')
  })
})

describe('theme-aware vocabulary verification', () => {
  it('accepts theme and shared ids', () => {
    const def = { ...structuredClone(CASES[0]), vocabulary: ['ship', 'fi', 'num-3'] as LexiconId[] }
    expect(verifyCaseVocab(def, THEMES.harbor, SHARED_VOCAB_IDS)).toEqual([])
  })
  it('rejects a Market noun in a Harbor case, and a Harbor noun in a Market case', () => {
    const harborCase = structuredClone(CASES[0])
    harborCase.tasks[0].vocab = [...harborCase.tasks[0].vocab, 'book']
    harborCase.clues[0].vocab = ['pen']
    harborCase.vocabulary = [...harborCase.vocabulary, 'card']
    const errs = verifyCaseVocab(harborCase, THEMES.harbor, SHARED_VOCAB_IDS).join('\n')
    expect(errs).toContain('"book" used in task')
    expect(errs).toContain('"pen" used in clue')
    expect(errs).toContain('"card" used in case vocabulary')
    expect(errs).toContain('not part of theme "harbor"')

    const marketCase = { ...structuredClone(CASES[0]), theme: 'market' as const }
    expect(verifyCaseVocab(marketCase, THEMES.market, SHARED_VOCAB_IDS).join('\n')).toContain('not part of theme "market"')
  })
  it('is part of the verifyContent pipeline', () => {
    const c = structuredClone(CASES)
    c[0].tasks[0].vocab = ['watch']
    expect(verifyContent(c).join('\n')).toContain('"watch" used in task')
  })
  it('keeps prepositions and numerals shared', () => {
    PREPS.forEach((p) => expect(SHARED_VOCAB_IDS.has(p.id)).toBe(true))
    NUMERALS.forEach((n) => expect(SHARED_VOCAB_IDS.has(n.id)).toBe(true))
    expect(SHARED_VOCAB_IDS.size).toBe(PREPS.length + NUMERALS.length)
  })
})

describe('per-theme numbering', () => {
  it('accepts independent 1..n sequences per theme', () => {
    expect(verifyCaseNumbering(CASES, THEMES)).toEqual([])
  })
  it('flags gaps, repeats and unknown themes', () => {
    const bad = verifyCaseNumbering([...CASES.slice(0, 6), market(3)], THEMES).join('\n')
    expect(bad).toContain('invalid case order')
    expect(bad).toContain('theme "market"')
    const unknown = verifyCaseNumbering([{ ...CASES[0], theme: 'zoo' as never }], THEMES).join('\n')
    expect(unknown).toContain('unknown theme "zoo"')
  })
  it('does not let Market cases disturb Harbor ordering', () => {
    expect(casesOfTheme('harbor', WITH_MARKET).map((c) => c.number)).toEqual([1, 2, 3, 4, 5])
    expect(casesOfTheme('market', WITH_MARKET).map((c) => c.id)).toEqual(['market-1', 'market-2', 'market-3', 'market-4', 'market-5'])
    expect(nextCaseInTheme(CASES[4], WITH_MARKET)).toBeUndefined()
  })
})

describe('unlock across themes', () => {
  it('keeps the first Market case locked until Harbor case 2 is completed', () => {
    const p = fresh()
    expect(isCaseUnlocked(p, defaultSettings(), M1, WITH_MARKET)).toBe(false)
    done(p, 'harbor-1')
    expect(isCaseUnlocked(p, defaultSettings(), M1, WITH_MARKET)).toBe(false)
    done(p, 'harbor-2')
    expect(isCaseUnlocked(p, defaultSettings(), M1, WITH_MARKET)).toBe(true)
  })
  it('chains Market cases within the Market theme only', () => {
    const p = done(fresh(), 'harbor-1', 'harbor-2')
    expect(isCaseUnlocked(p, defaultSettings(), M2, WITH_MARKET)).toBe(false)
    done(p, 'market-1')
    expect(isCaseUnlocked(p, defaultSettings(), M2, WITH_MARKET)).toBe(true)
  })
  it('market progress does not unlock or relock Harbor', () => {
    const p = done(fresh(), 'market-1')
    expect(isCaseUnlocked(p, defaultSettings(), CASES[2], WITH_MARKET)).toBe(false)
    expect(isCaseUnlocked(null, defaultSettings(), CASES[0], WITH_MARKET)).toBe(true)
  })
  it('demo unlock opens everything and the locked reason names the gate', () => {
    expect(isCaseUnlocked(fresh(), { ...defaultSettings(), demoUnlock: true }, M2, WITH_MARKET)).toBe(true)
    expect(lockedReason(M1, WITH_MARKET)).toContain('Case 2')
    expect(lockedReason(M2, WITH_MARKET)).toBe('Selesaikan Case 1 dulu.')
  })
})

describe('persistence stays backward compatible', () => {
  it('keeps existing Harbor progress and accepts Market case ids without a migration', () => {
    const legacy = {
      version: 1, activePlayerId: 'a',
      players: { a: { name: 'Ani', className: 'XI', progress: { 'harbor-1': { completed: true, stars: 3, bestXp: 120, attempts: 2 }, 'harbor-2': { completed: true, stars: 2 } } } },
      settings: { demoUnlock: false },
    }
    const s = sanitizeState(legacy)
    expect(s.activePlayerId).toBe('a')
    expect(s.players.a.progress['harbor-1']).toMatchObject({ completed: true, stars: 3, bestXp: 120, attempts: 2 })
    expect(s.players.a.progress['harbor-2'].completed).toBe(true)
    expect(isCaseUnlocked(s.players.a, s.settings, M1, WITH_MARKET)).toBe(true)

    const withMarket = sanitizeState({ ...legacy, players: { a: { ...legacy.players.a, progress: { ...legacy.players.a.progress, 'market-1': { completed: true, stars: 1 } } } } })
    expect(withMarket.players.a.progress['market-1']).toMatchObject({ completed: true, stars: 1 })
    expect(withMarket.players.a.progress['harbor-1'].stars).toBe(3)
  })
})

describe('Market vocabulary and numerals', () => {
  it('Market nouns carry counting grammar and build correct phrases', () => {
    const byId = Object.fromEntries(MARKET_COUNTABLES.map((v) => [v.id, v]))
    expect(countedPhrase(3, countedNounOf(byId.book))).toBe('ثَلَاثَةُ كُتُبٍ')
    expect(countedPhrase(3, countedNounOf(byId.watch))).toBe('ثَلَاثُ سَاعَاتٍ')
    expect(countedPhrase(5, countedNounOf(byId.shirt))).toBe('خَمْسَةُ قُمْصَانٍ')
    expect(countedPhrase(5, countedNounOf(byId.apple))).toBe('خَمْسُ تُفَّاحَاتٍ')
    expect(countedPhrase(2, countedNounOf(byId.card))).toBe('بِطَاقَتَانِ اثْنَتَانِ')
    expect(countedPhrase(1, countedNounOf(byId.pen))).toBe('قَلَمٌ وَاحِدٌ')
  })
  it('numerals are addressable like any other lexicon item', () => {
    expect(labelOf('num-3')).toMatchObject({ idn: 'tiga' })
    expect(getLexeme('num-10')?.ar).toContain('عَشَرَةُ')
    expect(getLexeme('book')?.idn).toBe('buku')
    expect(getLexeme('amama')?.idn).toBe('di depan')
    expect(getLexeme('nope')).toBeUndefined()
  })
  it('Dalil can gloss Market sentences (nouns, dual, plural genitive, both numeral forms)', () => {
    for (const s of ['كِتَابٌ وَاحِدٌ', 'كِتَابَانِ اثْنَانِ', 'ثَلَاثَةُ كُتُبٍ', 'ثَلَاثُ سَاعَاتٍ', 'سَاعَتَانِ اثْنَتَانِ', 'خَمْسُ تُفَّاحَاتٍ', 'عَشْرُ بِطَاقَاتٍ', 'ثَمَانِيَةُ أَقْلَامٍ']) {
      const missing = glossSentence(s).filter((g) => !g.entry).map((g) => g.surface)
      expect(missing, s).toEqual([])
    }
    const g = glossSentence('ثَلَاثَةُ كُتُبٍ')
    expect(g[0].entry?.kind).toBe('numeral')
    expect(g[0].entry?.idn).toContain('maskulin')
    expect(glossSentence('ثَلَاثُ سَاعَاتٍ')[0].entry?.idn).toContain('feminin')
  })
})

describe('Market scene stub', () => {
  it('renders selectable goods through the shared scene contract', () => {
    const onSelect = vi.fn()
    render(<MarketScene entities={['book', 'watch', 'card']} onSelect={onSelect} marks={{ watch: 'found' }} labeled={['watch']} />)
    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(3)
    fireEvent.click(buttons[1])
    expect(onSelect).toHaveBeenCalledWith('watch')
    expect(screen.getByText('سَاعَةٌ')).toBeTruthy()
  })
  it('ignores non-Market entity kinds and respects disabled', () => {
    const onSelect = vi.fn()
    render(<MarketScene entities={['ship', 'book']} onSelect={onSelect} disabled />)
    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(1)
    fireEvent.click(buttons[0])
    expect(onSelect).not.toHaveBeenCalled()
  })
})
