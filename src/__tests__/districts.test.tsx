import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { act, cleanup, render, screen } from '@testing-library/react'
import { App } from '../app/App'
import { CASES, casesOfTheme, getCase } from '../data/cases'
import { canonicalCaseId } from '../data/caseIds'
import { verifyContent } from '../engine/verifyContent'
import { sanitizeState, STATE_VERSION } from '../services/persistence/schema'
import { sanitizeSession } from '../stores/gameStore'
import { usePlayerStore } from '../stores/playerStore'
import { useGameStore } from '../stores/gameStore'
import { THEMES } from '../themes/registry'
import { TINTABLE_MARKET_ENTITIES, MARKET_SCENES } from '../themes/scenes'
import type { CaseDefinition, CaseResult, ChoiceTask } from '../types'

const result = (caseId: string): Omit<CaseResult, 'firstClear'> => ({
  caseId, at: Date.now(), accuracy: 0.9, xp: 300, stars: 3, correct: 9, mistakes: 1, hints: 0, evidenceFound: 4, evidenceTotal: 4, timeMs: 60000, vocab: {},
})

beforeEach(() => { window.scrollTo = () => {}; localStorage.clear(); usePlayerStore.getState().resetAll(); useGameStore.getState().clearSession() })
afterEach(cleanup)

describe('case id migration', () => {
  it('maps every legacy id to a namespaced Harbor id and leaves current ids alone', () => {
    expect([1, 2, 3, 4, 5].map((n) => canonicalCaseId(`case-${n}`))).toEqual(['harbor-1', 'harbor-2', 'harbor-3', 'harbor-4', 'harbor-5'])
    expect(canonicalCaseId('harbor-3')).toBe('harbor-3')
    expect(canonicalCaseId('market-2')).toBe('market-2')
    expect(canonicalCaseId('something-else')).toBe('something-else')
    expect(getCase('case-4')?.id).toBe('harbor-4')
    expect(getCase('harbor-4')?.id).toBe('harbor-4')
    expect(getCase('case-9')).toBeUndefined()
  })

  const legacy = (progress: Record<string, unknown>, results: unknown[] = []) => ({
    version: 1, activePlayerId: 'a',
    players: { a: { name: 'Ani', className: 'XI', progress, results } },
    settings: { demoUnlock: false },
  })

  it('rewrites legacy progress keys and result case ids without losing data', () => {
    const s = sanitizeState(legacy(
      { 'case-1': { completed: true, stars: 3, bestXp: 400, attempts: 2 }, 'case-2': { completed: true, stars: 1, bestXp: 120 } },
      [{ caseId: 'case-1', at: 5, accuracy: 0.8, xp: 400, stars: 3, correct: 8, mistakes: 2, hints: 1, evidenceFound: 5, evidenceTotal: 7, timeMs: 50000, vocab: {} }],
    ))
    const p = s.players.a
    expect(Object.keys(p.progress).sort()).toEqual(['harbor-1', 'harbor-2'])
    expect(p.progress['harbor-1']).toMatchObject({ caseId: 'harbor-1', completed: true, stars: 3, bestXp: 400, attempts: 2 })
    expect(p.results[0].caseId).toBe('harbor-1')
    expect(s.version).toBe(STATE_VERSION)
  })

  it('keeps the better record when a legacy id and its namespaced twin both exist', () => {
    const s = sanitizeState(legacy({ 'case-1': { completed: true, stars: 3, bestXp: 500 }, 'harbor-1': { completed: true, stars: 1, bestXp: 100 } }))
    expect(s.players.a.progress['harbor-1']).toMatchObject({ stars: 3, bestXp: 500 })
    expect(Object.keys(s.players.a.progress)).toEqual(['harbor-1'])
    const rev = sanitizeState(legacy({ 'harbor-1': { completed: true, stars: 3, bestXp: 500 }, 'case-1': { completed: false, stars: 0, bestXp: 0 } }))
    expect(rev.players.a.progress['harbor-1']).toMatchObject({ completed: true, stars: 3 })
  })

  it('is idempotent: migrating twice changes nothing', () => {
    const once = sanitizeState(legacy({ 'case-3': { completed: true, stars: 2, bestXp: 250 } }))
    const twice = sanitizeState(JSON.parse(JSON.stringify(once)))
    expect(twice.players.a.progress).toEqual(once.players.a.progress)
  })

  it('migrates a saved in-progress session to the new case id', () => {
    const s = sanitizeSession({ playerId: 'a', caseId: 'case-2', stage: 'play', taskIndex: 1, elapsedMs: 10, xp: 0, mistakes: 0, correct: 0, hints: 0, evidence: [], revealed: [], learned: [], taskStats: {}, vocabC: {}, vocabW: {} })
    expect(s?.caseId).toBe('harbor-2')
  })

  it('redirects a legacy /case/case-N link to the namespaced route', () => {
    const id = usePlayerStore.getState().createPlayer('Ani', 'XI')
    usePlayerStore.getState().setSettings({ demoUnlock: true })
    expect(id).toBeTruthy()
    window.history.pushState({}, '', '/case/case-2')
    render(<App />)
    expect(window.location.pathname).toBe('/case/harbor-2')
  })
})

describe('district unlocking in the UI', () => {
  it('announces the Market district when Harbor case 2 is cleared for the first time', async () => {
    usePlayerStore.getState().createPlayer('Ani', 'XI')
    await act(async () => {
      usePlayerStore.getState().recordResult(result('harbor-1'), CASES.find((c) => c.id === 'harbor-1')!)
      usePlayerStore.getState().recordResult(result('harbor-2'), CASES.find((c) => c.id === 'harbor-2')!)
    })
    window.history.pushState({}, '', '/results/harbor-2')
    render(<App />)
    expect((await screen.findByTestId('district-opened')).textContent).toContain('Pasar')
  })

  it('does not announce a district on other cases', async () => {
    usePlayerStore.getState().createPlayer('Ani', 'XI')
    await act(async () => { usePlayerStore.getState().recordResult(result('harbor-1'), CASES.find((c) => c.id === 'harbor-1')!) })
    window.history.pushState({}, '', '/results/harbor-1')
    render(<App />)
    expect(await screen.findByText(/LAPORAN PENUTUPAN/)).toBeTruthy()
    expect(screen.queryByTestId('district-opened')).toBeNull()
  })
})

describe('landing', () => {
  it('presents both districts and the total case count, not a single theme', async () => {
    window.history.pushState({}, '', '/')
    render(<App />)
    expect(await screen.findByRole('heading', { level: 1, name: /Arabic\s*Detective/ })).toBeTruthy()
    expect(screen.getByLabelText('Dua distrik investigasi')).toBeTruthy()
    expect(screen.getByText('PELABUHAN')).toBeTruthy()
    expect(screen.getByText('PASAR')).toBeTruthy()
    expect(screen.getAllByText('05 KASUS')).toHaveLength(2)
  })
})

describe('Market content', () => {
  const market = casesOfTheme('market')
  const choices = (def: CaseDefinition) => def.tasks.filter((t): t is ChoiceTask => t.type === 'choice')

  it('every Market case uses a Market scene and teaches with choice tasks', () => {
    market.forEach((c) => {
      expect(MARKET_SCENES as readonly string[]).toContain(c.scene)
      expect(choices(c).length).toBeGreaterThanOrEqual(1)
      expect(THEMES.market.scenes).toContain(c.scene)
    })
    expect(new Set(market.map((c) => c.scene)).size).toBeGreaterThanOrEqual(4) // distinct environments across the campaign
  })

  it('shows the learner a picture that agrees with the correct answer (count, price, colour, size)', () => {
    expect(verifyContent()).toEqual([])
  })

  it('catches a picture that disagrees with its answer', () => {
    const cases = structuredClone(CASES)
    const m4 = cases.find((c) => c.id === 'market-4')!
    const t = m4.tasks.find((x) => x.id === 'm4-shirt') as ChoiceTask
    if (t.visual.kind !== 'items') throw new Error('fixture changed')
    t.visual.items[0].color = 'green' // answer still says red
    expect(verifyContent(cases).join('\n')).toContain('does not mention "green"')

    const m2 = structuredClone(CASES)
    const c2 = (m2.find((c) => c.id === 'market-2')!.tasks.find((x) => x.id === 'm2-book') as ChoiceTask)
    if (c2.visual.kind !== 'count') throw new Error('fixture changed')
    c2.visual.count = 8 // answer says three
    expect(verifyContent(m2).join('\n')).toContain('does not contain the numeral for the 8 items shown')
  })

  it('refuses to colour an item whose glyph cannot be tinted', () => {
    const cases = structuredClone(CASES)
    const t = cases.find((c) => c.id === 'market-4')!.tasks.find((x) => x.id === 'm4-shirt') as ChoiceTask
    if (t.visual.kind !== 'items') throw new Error('fixture changed')
    t.visual.items[0] = { entity: 'ledger', color: 'red' }
    expect(verifyContent(cases).join('\n')).toContain('cannot be drawn in red')
    expect(TINTABLE_MARKET_ENTITIES).toContain('watch')
  })

  it('never puts the correct option in the same position for every task of a case', () => {
    market.forEach((c) => {
      const positions = choices(c).map((t) => t.options.findIndex((o) => o.id === t.correct))
      if (positions.length >= 3) expect(new Set(positions).size).toBeGreaterThan(1)
    })
  })

  it('every wrong option explains itself in Indonesian (no empty notes)', () => {
    market.forEach((c) => choices(c).forEach((t) => {
      t.options.filter((o) => o.id !== t.correct).forEach((o) => expect(t.wrongNotes[o.id]?.length ?? 0).toBeGreaterThan(15))
    }))
  })
})
