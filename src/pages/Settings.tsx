import { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/common/Button'
import { Modal } from '../components/common/Modal'
import { TopBar } from '../components/common/TopBar'
import { AppearancePreview } from '../components/settings/AppearancePreview'
import { AccentPicker, FontSelect, Segmented, SettingRow, SwitchControl } from '../components/settings/controls'
import { pendingCount } from '../services/cloud/supabase'
import { useActivePlayer, usePlayerStore } from '../stores/playerStore'
import { useGameStore } from '../stores/gameStore'
import { usePreferencesStore } from '../stores/preferencesStore'
import { useUiStore } from '../stores/uiStore'
import type { Preferences } from '../theme/preferences'

const CATEGORIES = [
  { id: 'appearance', label: 'Tampilan', desc: 'Tema, warna aksen, sudut, efek' },
  { id: 'typography', label: 'Tipografi', desc: 'Font dan ukuran teks antarmuka' },
  { id: 'arabic', label: 'Membaca Arab', desc: 'Font, ukuran, dan perataan teks Arab' },
  { id: 'layout', label: 'Tata letak', desc: 'Kerapatan dan lebar konten' },
  { id: 'motion', label: 'Gerak', desc: 'Animasi dan efek dekoratif' },
  { id: 'accessibility', label: 'Aksesibilitas', desc: 'Kontras, fokus, keterbacaan' },
  { id: 'gameplay', label: 'Permainan', desc: 'Mode Presentasi dan Dalil' },
  { id: 'data', label: 'Data', desc: 'Siswa aktif dan penghapusan data' },
] as const
type CategoryId = (typeof CATEGORIES)[number]['id']

const hashCategory = (): CategoryId => {
  const h = window.location.hash.replace('#', '')
  return (CATEGORIES.find((c) => c.id === h)?.id ?? 'appearance') as CategoryId
}

export function Settings() {
  const nav = useNavigate()
  const player = useActivePlayer()!
  const settings = usePlayerStore((s) => s.settings)
  const setSettings = usePlayerStore((s) => s.setSettings)
  const resetActive = usePlayerStore((s) => s.resetActiveProgress)
  const resetAll = usePlayerStore((s) => s.resetAll)
  const deletePlayer = usePlayerStore((s) => s.deletePlayer)
  const signOut = usePlayerStore((s) => s.signOut)
  const clearSession = useGameStore((s) => s.clearSession)
  const prefs = usePreferencesStore((s) => s.prefs)
  const setPrefs = usePreferencesStore((s) => s.setPrefs)
  const resetPrefs = usePreferencesStore((s) => s.resetPrefs)
  const push = useUiStore((s) => s.push)
  const [confirm, setConfirm] = useState<'me' | 'all' | 'delete' | null>(null)
  const [cat, setCat] = useState<CategoryId>(hashCategory)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  useEffect(() => {
    const onHash = () => setCat(hashCategory())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  const choose = (id: CategoryId) => { setCat(id); window.history.replaceState(null, '', `#${id}`) }
  function onTabKey(e: KeyboardEvent, i: number) {
    const keys: Record<string, number> = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }
    let n = -1
    if (e.key in keys) n = (i + keys[e.key] + CATEGORIES.length) % CATEGORIES.length
    else if (e.key === 'Home') n = 0
    else if (e.key === 'End') n = CATEGORIES.length - 1
    if (n < 0) return
    e.preventDefault(); choose(CATEGORIES[n].id); tabRefs.current[n]?.focus()
  }

  const set = <K extends keyof Preferences>(k: K) => (v: Preferences[K]) => setPrefs({ [k]: v } as Partial<Preferences>)

  const doReset = () => {
    clearSession()
    if (confirm === 'delete') { const id = player.id; deletePlayer(id); push({ kind: 'success', title: 'Siswa dihapus' }); nav('/setup') }
    else if (confirm === 'all') { resetAll(); push({ kind: 'success', title: 'Semua data siswa dihapus', body: 'Pengaturan tampilan tetap dipertahankan.' }); nav('/') }
    else { resetActive(); push({ kind: 'success', title: 'Progres direset', body: `Progres ${player.name} dikembalikan dari awal.` }) }
    setConfirm(null)
  }
  const restoreAppearance = () => { resetPrefs(); push({ kind: 'success', title: 'Tampilan dipulihkan', body: 'Hanya pengaturan tampilan. Progres dan nilai tidak berubah.' }) }

  const body: Record<CategoryId, React.ReactNode> = {
    appearance: (
      <>
        <SettingRow label="Tema" desc="Gelap (meja detektif) adalah tampilan bawaan. Terang memakai meja krem dengan kertas berkas yang tetap krem.">
          <Segmented label="Tema" value={prefs.theme} onChange={set('theme')} options={[{ value: 'dark', label: 'Gelap' }, { value: 'light', label: 'Terang' }, { value: 'system', label: 'Ikuti sistem' }]} />
        </SettingRow>
        <SettingRow label="Warna aksen" desc="Dipakai untuk tombol utama, penanda aktif, dan angka penting. Semua pilihan lolos uji kontras." stack>
          <AccentPicker label="Warna aksen" value={prefs.accent} onChange={set('accent')} options={[{ value: 'gold', label: 'Emas' }, { value: 'amber', label: 'Ambar' }, { value: 'emerald', label: 'Zamrud' }, { value: 'blue', label: 'Biru' }, { value: 'crimson', label: 'Merah tua' }]} />
        </SettingRow>
        <SettingRow label="Gaya sudut" desc="Kelengkungan panel, kartu, kolom isian, dan tombol.">
          <Segmented label="Gaya sudut" value={prefs.radius} onChange={set('radius')} options={[{ value: 'sharp', label: 'Tajam' }, { value: 'slight', label: 'Tipis' }, { value: 'rounded', label: 'Membulat' }, { value: 'extra', label: 'Sangat bulat' }]} />
        </SettingRow>
        <SettingRow label="Tekstur kertas" desc="Butiran halus pada kertas berkas."><SwitchControl label="Tekstur kertas" on={prefs.paperGrain} onChange={set('paperGrain')} /></SettingRow>
        <SettingRow label="Grid latar" desc="Garis koordinat samar di belakang halaman."><SwitchControl label="Grid latar" on={prefs.backgroundGrid} onChange={set('backgroundGrid')} /></SettingRow>
      </>
    ),
    typography: (
      <>
        <SettingRow label="Font antarmuka" desc="Untuk teks Indonesia dan tombol. Semua font tersimpan di aplikasi, tanpa internet." stack>
          <FontSelect label="Font antarmuka" value={prefs.uiFont} onChange={set('uiFont')} options={[{ value: 'inter', label: 'Inter (bawaan)' }, { value: 'system', label: 'Font sistem' }, { value: 'plex', label: 'IBM Plex Sans' }, { value: 'atkinson', label: 'Atkinson Hyperlegible' }]} />
        </SettingRow>
        <SettingRow label="Ukuran teks" desc="Mengubah seluruh teks antarmuka: menu, kartu, tombol, instruksi.">
          <Segmented label="Ukuran teks" value={prefs.uiSize} onChange={set('uiSize')} options={[{ value: 'small', label: 'Kecil' }, { value: 'default', label: 'Standar' }, { value: 'large', label: 'Besar' }, { value: 'xlarge', label: 'Sangat besar' }]} />
        </SettingRow>
        <SettingRow label="Jarak baris" desc="Jarak antarbaris pada teks Indonesia.">
          <Segmented label="Jarak baris" value={prefs.uiLeading} onChange={set('uiLeading')} options={[{ value: 'compact', label: 'Rapat' }, { value: 'comfortable', label: 'Nyaman' }, { value: 'relaxed', label: 'Longgar' }]} />
        </SettingRow>
      </>
    ),
    arabic: (
      <>
        <SettingRow label="Font Arab" desc="Khusus teks Arab. Semuanya mendukung harakat lengkap." stack>
          <FontSelect arabic label="Font Arab" value={prefs.arabicFont} onChange={set('arabicFont')} options={[{ value: 'naskh', label: 'Noto Naskh Arabic (bawaan)' }, { value: 'amiri', label: 'Amiri' }, { value: 'scheherazade', label: 'Scheherazade New' }]} />
        </SettingRow>
        <SettingRow label="Ukuran teks Arab" desc="Terpisah dari ukuran teks antarmuka, supaya Arab bisa lebih besar.">
          <Segmented label="Ukuran teks Arab" value={prefs.arabicSize} onChange={set('arabicSize')} options={[{ value: 'normal', label: 'Normal' }, { value: 'large', label: 'Besar' }, { value: 'xlarge', label: 'Sangat besar' }]} />
        </SettingRow>
        <SettingRow label="Jarak baris Arab" desc="Longgar memberi ruang lebih untuk harakat. Judul dan chip yang sengaja padat tidak ikut berubah.">
          <Segmented label="Jarak baris Arab" value={prefs.arabicLeading} onChange={set('arabicLeading')} options={[{ value: 'compact', label: 'Rapat' }, { value: 'comfortable', label: 'Nyaman' }, { value: 'relaxed', label: 'Longgar' }]} />
        </SettingRow>
        <SettingRow label="Perataan teks Arab" desc="Otomatis mengikuti tata letak tiap halaman. Pilihan lain berlaku untuk blok Arab mandiri, bukan untuk daftar, tabel, dan chip.">
          <Segmented label="Perataan teks Arab" value={prefs.arabicAlign} onChange={set('arabicAlign')} options={[{ value: 'auto', label: 'Otomatis' }, { value: 'right', label: 'Kanan' }, { value: 'center', label: 'Tengah' }]} />
        </SettingRow>
        <SettingRow label="Ketebalan teks Arab" desc="Tebal membuat huruf dan harakat lebih jelas.">
          <Segmented label="Ketebalan teks Arab" value={prefs.arabicWeight} onChange={set('arabicWeight')} options={[{ value: 'normal', label: 'Normal' }, { value: 'bold', label: 'Tebal' }]} />
        </SettingRow>
      </>
    ),
    layout: (
      <>
        <SettingRow label="Kerapatan" desc="Jarak, padding, dan tinggi kontrol. Rapat: target sentuh 40px. Lega: 48px.">
          <Segmented label="Kerapatan" value={prefs.density} onChange={set('density')} options={[{ value: 'compact', label: 'Rapat' }, { value: 'comfortable', label: 'Nyaman' }, { value: 'spacious', label: 'Lega' }]} />
        </SettingRow>
        <SettingRow label="Lebar konten" desc="Batas lebar halaman di layar lebar (mulai 1280px). Di HP dan tablet tidak ada pengaruhnya.">
          <Segmented label="Lebar konten" value={prefs.contentWidth} onChange={set('contentWidth')} options={[{ value: 'narrow', label: 'Sempit' }, { value: 'standard', label: 'Standar' }, { value: 'wide', label: 'Lebar' }]} />
        </SettingRow>
      </>
    ),
    motion: (
      <>
        <SettingRow label="Animasi" desc="Ikuti sistem memakai pengaturan 'kurangi gerakan' dari perangkatmu. Pilihan eksplisit di sini selalu didahulukan. Penanda status (benar, salah, bukti ditemukan) tetap terlihat, hanya tanpa gerakan.">
          <Segmented label="Animasi" value={prefs.motion} onChange={set('motion')} options={[{ value: 'system', label: 'Ikuti sistem' }, { value: 'full', label: 'Penuh' }, { value: 'reduced', label: 'Dikurangi' }, { value: 'none', label: 'Tanpa animasi' }]} />
        </SettingRow>
        <SettingRow label="Animasi dekoratif" desc="Garis rute berjalan dan efek hiasan lain. Tidak memengaruhi petunjuk status permainan."><SwitchControl label="Animasi dekoratif" on={prefs.decorativeMotion} onChange={set('decorativeMotion')} /></SettingRow>
      </>
    ),
    accessibility: (
      <>
        <SettingRow label="Kontras tinggi" desc="Teks lebih tegas, garis tepi lebih tebal, status terpilih lebih jelas, dan fokus keyboard diperkuat."><SwitchControl label="Kontras tinggi" on={prefs.highContrast} onChange={set('highContrast')} /></SettingRow>
        <SettingRow label="Fokus keyboard tebal" desc="Bingkai dua warna yang terlihat di atas latar apa pun."><SwitchControl label="Fokus keyboard tebal" on={prefs.strongFocus} onChange={set('strongFocus')} /></SettingRow>
        <SettingRow label="Mode keterbacaan tinggi" desc="Jarak huruf, kata, dan baris sedikit lebih longgar. Untuk font yang lebih jelas, pilih Atkinson Hyperlegible di Tipografi."><SwitchControl label="Mode keterbacaan tinggi" on={prefs.readability} onChange={set('readability')} /></SettingRow>
        <SettingRow label="Kurangi transparansi" desc="Panel dan lapisan dibuat solid, tekstur kertas dimatikan."><SwitchControl label="Kurangi transparansi" on={prefs.reduceTransparency} onChange={set('reduceTransparency')} /></SettingRow>
      </>
    ),
    gameplay: (
      <>
        <SettingRow label="Mode Presentasi" desc="Untuk demo/juri: semua kasus terbuka tanpa urutan. Progres utama tidak diubah; membuka kasus lain tidak menandai kasus sebelumnya selesai."><SwitchControl label="Mode Presentasi" on={settings.demoUnlock} onChange={(v) => setSettings({ demoUnlock: v })} /></SettingRow>
        <div className="border-b border-ink-600 py-4">
          <p className="text-sm font-semibold">Asisten Dalil</p>
          <p className="mt-0.5 max-w-prose text-xs text-cream-300">Sistem petunjuk bertingkat yang disusun sebelumnya. Berjalan sepenuhnya offline, hasilnya selalu konsisten, dan tidak pernah memberi jawaban akhir.</p>
        </div>
      </>
    ),
    data: (
      <>
        <div className="border-b border-ink-600 py-4">
          <p className="text-sm font-semibold">Siswa aktif</p>
          <p className="docno mt-1">{player.name.toUpperCase()}{player.className ? ` · ${player.className.toUpperCase()}` : ''}</p>
          <div className="mt-3"><Button onClick={() => { signOut(); nav('/setup') }}>Ganti siswa</Button></div>
        </div>
        <div className="mt-6 border border-coral/60 p-4">
          <p className="label !text-bad">Tindakan permanen</p>
          <p className="mt-1 text-xs text-cream-300">Tidak bisa dibatalkan, dan kamu akan diminta konfirmasi. Pengaturan tampilan tidak ikut terhapus.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant="danger" size="sm" onClick={() => setConfirm('me')}>Reset progres</Button>
            <Button variant="danger" size="sm" onClick={() => setConfirm('delete')}>Hapus siswa ini</Button>
            <Button variant="danger" size="sm" onClick={() => setConfirm('all')}>Hapus semua data</Button>
          </div>
        </div>
      </>
    ),
  }
  const active = CATEGORIES.find((c) => c.id === cat)!

  return (
    <>
      <TopBar title="Pengaturan" back="/cases" />
      <main className="mx-auto grid max-w-page gap-6 px-4 py-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-10 lg:px-8 lg:py-8 xl:grid-cols-[220px_minmax(0,1fr)_380px]">
        <aside className="lg:sticky lg:top-[72px] lg:self-start">
          <div role="tablist" aria-label="Kategori pengaturan" aria-orientation="vertical" className="grid grid-cols-2 gap-1.5 sm:grid-cols-4 lg:grid-cols-1 lg:gap-0">
            {CATEGORIES.map((c, i) => {
              const on = c.id === cat
              return (
                <button key={c.id} ref={(el) => { tabRefs.current[i] = el }} role="tab" id={`tab-${c.id}`} aria-selected={on} aria-controls="settings-panel" tabIndex={on ? 0 : -1}
                  onClick={() => choose(c.id)} onKeyDown={(e) => onTabKey(e, i)}
                  className={`tap rounded-lg border px-3 py-2 text-left text-sm font-medium transition-colors lg:rounded-none lg:border-0 lg:border-b lg:border-l-2 lg:py-2.5 ${on ? 'border-gold-500 bg-ink-800 text-cream-100 lg:border-l-gold-500' : 'border-ink-600 text-cream-300 hover:bg-ink-800 lg:border-l-transparent'}`}>
                  {c.label}
                </button>
              )
            })}
          </div>
          <div className="mt-4 hidden lg:block">
            <Button size="sm" className="w-full" onClick={restoreAppearance}>Pulihkan tampilan bawaan</Button>
            <p className="mt-1.5 text-xs text-cream-400">Hanya tampilan. Progres dan nilai aman.</p>
          </div>
        </aside>

        <section role="tabpanel" id="settings-panel" aria-labelledby={`tab-${cat}`} className="min-w-0">
          <div className="xl:hidden"><AppearancePreview /></div>
          <div className="mb-1 mt-6 flex items-end justify-between gap-3 border-b border-cream-100/60 pb-2 xl:mt-0">
            <div><h2 className="text-xl font-bold">{active.label}</h2><p className="text-xs text-cream-300">{active.desc}</p></div>
          </div>
          {body[cat]}
          <div className="mt-6 lg:hidden">
            <Button className="w-full" onClick={restoreAppearance}>Pulihkan tampilan bawaan</Button>
            <p className="mt-1.5 text-xs text-cream-400">Hanya tampilan. Progres dan nilai aman.</p>
          </div>
        </section>

        <aside className="hidden xl:sticky xl:top-[72px] xl:block xl:self-start"><AppearancePreview /></aside>
      </main>
      <Modal open={confirm !== null} onClose={() => setConfirm(null)}
        title={confirm === 'all' ? 'Hapus semua data siswa?' : confirm === 'delete' ? `Hapus siswa ${player.name}?` : `Reset progres ${player.name}?`}>
        <p className="text-sm text-cream-300">
          {confirm === 'all' ? 'Seluruh siswa, progres, dan pencapaian di browser ini akan dihapus. Tindakan ini tidak bisa dibatalkan.'
            : confirm === 'delete' ? 'Siswa ini beserta progres dan pencapaiannya dihapus dari perangkat ini. Tidak bisa dibatalkan.'
              : 'XP, bintang, pencapaian, dan statistik siswa ini akan dikembalikan ke awal.'}
        </p>
        {pendingCount() > 0 && <p className="mt-2 border-l-2 border-gold-500 bg-ink-900 px-3 py-2 text-xs text-gold-300">Ada {pendingCount()} nilai yang belum terkirim ke cloud. Nilai itu tetap disimpan di antrean dan akan dikirim saat online.</p>}
        <div className="mt-4 flex justify-end gap-2"><Button onClick={() => setConfirm(null)}>Batal</Button><Button variant="danger" onClick={doReset}>{'Ya, lanjutkan'}</Button></div>
      </Modal>
    </>
  )
}
