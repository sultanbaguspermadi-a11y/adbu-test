import { beforeEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Settings } from '../pages/Settings'
import { usePlayerStore } from '../stores/playerStore'
import { usePreferencesStore } from '../stores/preferencesStore'
import { DEFAULT_PREFERENCES } from '../theme/preferences'

const mount = (hash = '') => { window.location.hash = hash; return render(<MemoryRouter><Settings /></MemoryRouter>) }
const prefs = () => usePreferencesStore.getState().prefs

beforeEach(() => { cleanup(); localStorage.clear(); window.location.hash = ''; usePlayerStore.getState().resetAll(); usePreferencesStore.getState().resetPrefs(); usePlayerStore.getState().createPlayer('Uji', 'X') })

describe('Settings page', () => {
  it('groups settings into the eight categories and shows one at a time', () => {
    mount()
    const tabs = screen.getAllByRole('tab').map((t) => t.textContent)
    expect(tabs).toEqual(['Tampilan', 'Tipografi', 'Membaca Arab', 'Tata letak', 'Gerak', 'Aksesibilitas', 'Permainan', 'Data'])
    expect(screen.getByRole('radiogroup', { name: 'Tema' })).toBeTruthy()
    expect(screen.queryByRole('radiogroup', { name: 'Ukuran teks' })).toBeNull()
    fireEvent.click(screen.getByRole('tab', { name: 'Tipografi' }))
    expect(screen.getByRole('radiogroup', { name: 'Ukuran teks' })).toBeTruthy()
  })
  it('opens the category named in the URL hash', () => {
    mount('#arabic')
    expect(screen.getByRole('radiogroup', { name: 'Ukuran teks Arab' })).toBeTruthy()
  })
  it('a segmented choice updates the preference immediately', () => {
    mount()
    fireEvent.click(within(screen.getByRole('radiogroup', { name: 'Tema' })).getByRole('radio', { name: 'Terang' }))
    expect(prefs().theme).toBe('light')
    fireEvent.click(within(screen.getByRole('radiogroup', { name: 'Warna aksen' })).getByRole('radio', { name: 'Zamrud' }))
    expect(prefs().accent).toBe('emerald')
  })
  it('segmented control is a real radio group: one tab stop, arrow keys move and select', () => {
    mount()
    const group = screen.getByRole('radiogroup', { name: 'Gaya sudut' })
    const radios = within(group).getAllByRole('radio')
    expect(radios.filter((r) => r.tabIndex === 0)).toHaveLength(1)
    fireEvent.keyDown(radios[2], { key: 'ArrowRight' })
    expect(prefs().radius).toBe('extra')
    fireEvent.keyDown(within(group).getAllByRole('radio')[3], { key: 'ArrowRight' }) // wraps
    expect(prefs().radius).toBe('sharp')
  })
  it('the category list supports arrow-key navigation', () => {
    mount()
    const tabs = screen.getAllByRole('tab')
    fireEvent.keyDown(tabs[0], { key: 'ArrowDown' })
    expect(screen.getByRole('tab', { name: 'Tipografi' }).getAttribute('aria-selected')).toBe('true')
    fireEvent.keyDown(screen.getByRole('tab', { name: 'Tipografi' }), { key: 'End' })
    expect(screen.getByRole('tab', { name: 'Data' }).getAttribute('aria-selected')).toBe('true')
  })
  it('fonts use selects, booleans use switches, and the preview shows the selected font specimen', () => {
    mount('#typography')
    fireEvent.change(screen.getByRole('combobox', { name: 'Font antarmuka' }), { target: { value: 'plex' } })
    expect(prefs().uiFont).toBe('plex')
    expect(screen.getByTestId('specimen-ui').querySelector('[data-ui-font="plex"]')).toBeTruthy()
    cleanup(); mount('#accessibility')
    const sw = screen.getByRole('switch', { name: 'Kontras tinggi' })
    expect(sw.getAttribute('aria-checked')).toBe('false')
    fireEvent.click(sw)
    expect(prefs().highContrast).toBe(true)
    expect(screen.getByRole('switch', { name: 'Kontras tinggi' }).getAttribute('aria-checked')).toBe('true')
  })
  it('motion offers system / full / reduced / none', () => {
    mount('#motion')
    const labels = within(screen.getByRole('radiogroup', { name: 'Animasi' })).getAllByRole('radio').map((r) => r.textContent)
    expect(labels).toEqual(['Ikuti sistem', 'Penuh', 'Dikurangi', 'Tanpa animasi'])
  })
  it('restore appearance defaults resets only appearance (students and progress stay)', () => {
    mount()
    usePreferencesStore.getState().setPrefs({ theme: 'light', accent: 'blue', uiSize: 'xlarge' })
    const before = JSON.stringify(usePlayerStore.getState().players)
    fireEvent.click(screen.getAllByRole('button', { name: 'Pulihkan tampilan bawaan' })[0])
    expect(prefs()).toEqual(DEFAULT_PREFERENCES)
    expect(JSON.stringify(usePlayerStore.getState().players)).toBe(before)
    expect(Object.keys(usePlayerStore.getState().players)).toHaveLength(1)
  })
  it('renders a live preview with Indonesian and Arabic sample text', () => {
    mount()
    const preview = screen.getAllByTestId('appearance-preview')[0]
    expect(within(preview).getByText('Contoh antarmuka penyelidikan')).toBeTruthy()
    expect(preview.querySelector('[lang="ar"][dir="rtl"]')).toBeTruthy()
  })
  it('keeps the gameplay and destructive data actions, with confirmation', async () => {
    mount('#gameplay')
    fireEvent.click(screen.getByRole('switch', { name: 'Mode Presentasi' }))
    expect(usePlayerStore.getState().settings.demoUnlock).toBe(true)
    cleanup(); mount('#data')
    fireEvent.click(screen.getByRole('button', { name: 'Reset progres' }))
    expect(screen.getByRole('dialog')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Batal' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  })
})
