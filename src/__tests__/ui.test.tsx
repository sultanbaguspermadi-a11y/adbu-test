import { beforeEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { CASES } from '../data/cases'
import { FieldNotes } from '../components/dalil/DalilPanel'
import { CaseSelect } from '../pages/CaseSelect'
import { useGameStore } from '../stores/gameStore'
import { usePlayerStore } from '../stores/playerStore'

beforeEach(() => { cleanup(); localStorage.clear(); usePlayerStore.getState().resetAll(); useGameStore.getState().clearSession() })

describe('Dalil field notes (not a chatbot)', () => {
  it('shows the 3-level ladder and advances only on the hint button; no text input exists', () => {
    const def = CASES[0]; const task = def.tasks[0]
    const pid = usePlayerStore.getState().createPlayer('Uji', '')
    useGameStore.getState().startCase(pid, def.id)
    render(<FieldNotes def={def} task={task} />)
    expect(screen.getByText('PETUNJUK 0 / 3')).toBeTruthy()
    expect(screen.queryByRole('textbox')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Beri petunjuk' }))
    expect(screen.getByText('PETUNJUK 1 / 3')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Petunjuk berikutnya' }))
    fireEvent.click(screen.getByRole('button', { name: 'Petunjuk berikutnya' }))
    expect(screen.getByText('PETUNJUK 3 / 3')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Ulangi petunjuk terakhir' })).toBeTruthy()
    // free reflective help does not move the ladder
    fireEvent.click(screen.getByRole('button', { name: 'Kenapa salah?' }))
    expect(screen.getByText('PETUNJUK 3 / 3')).toBeTruthy()
  })
})

describe('Case archive', () => {
  it('lists every case as a file row with a status stamp; only Harbor case 1 is open for a new player', () => {
    usePlayerStore.getState().createPlayer('Uji', 'X')
    render(<MemoryRouter><CaseSelect /></MemoryRouter>)
    const rows = screen.getAllByRole('listitem').filter((li) => li.querySelector('button'))
    expect(rows.length).toBe(CASES.length)
    const locked = rows.filter((li) => li.textContent?.includes('Terkunci'))
    expect(locked).toHaveLength(CASES.length - 1)
    expect(screen.getByText('Buka case →')).toBeTruthy()
  })

  it('groups cases into two district dossiers and explains why Market is locked', () => {
    usePlayerStore.getState().createPlayer('Uji', 'X')
    render(<MemoryRouter><CaseSelect /></MemoryRouter>)
    expect(screen.getByRole('heading', { name: /Arsip investigasi/ })).toBeTruthy()
    expect(screen.getByRole('region', { name: /Pelabuhan/ })).toBeTruthy()
    expect(screen.getByRole('region', { name: /Pasar/ })).toBeTruthy()
    expect(screen.getByRole('note').textContent).toContain('Selesaikan Case 2 (Pelabuhan)')
    expect(screen.getByRole('progressbar', { name: 'Kemajuan distrik Pasar' }).getAttribute('aria-valuenow')).toBe('0')
  })
})
