import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/common/Button'
import { TopBar } from '../components/common/TopBar'
import { completedCount, totalXp } from '../engine/analytics'
import { usePlayerStore } from '../stores/playerStore'
import { CASES } from '../data/cases'
import { pad2 } from '../utils/arabic'

export function Setup() {
  const nav = useNavigate()
  const players = usePlayerStore((s) => s.players)
  const create = usePlayerStore((s) => s.createPlayer)
  const select = usePlayerStore((s) => s.selectPlayer)
  const [name, setName] = useState('')
  const [cls, setCls] = useState('')
  const [err, setErr] = useState('')
  const list = Object.values(players).sort((a, b) => b.createdAt - a.createdAt)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const n = name.trim()
    if (n.length < 2) { setErr('Tulis nama siswa minimal 2 huruf.'); return }
    if (n.length > 40) { setErr('Nama terlalu panjang (maksimal 40 karakter).'); return }
    create(n, cls)
    nav('/tutorial')
  }

  return (
    <>
      <TopBar title="Pendaftaran penyelidik" back="/" />
      <main className="mx-auto grid max-w-page gap-8 px-4 py-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-12 lg:px-8 lg:py-10">
        <form onSubmit={submit} className="paper reg self-start p-6 sm:p-8" noValidate>
          <p className="docno">FORMULIR NO. AD-REG</p>
          <h2 className="mt-1 text-xl font-bold">Penyelidik baru</h2>
          <label className="label mt-5 mb-1 block" htmlFor="nm">Nama siswa</label>
          <input id="nm" value={name} onChange={(e) => { setName(e.target.value); setErr('') }} autoComplete="off" maxLength={60}
            className="field mb-1" placeholder="mis. Ahmad Fauzi" aria-describedby="nm-err" aria-invalid={Boolean(err)} />
          <p id="nm-err" className="mb-3 min-h-[1.25rem] text-sm text-coral" role="alert">{err}</p>
          <label className="label mb-1 block" htmlFor="kl">Kelas <span className="normal-case tracking-normal">(opsional)</span></label>
          <input id="kl" value={cls} onChange={(e) => setCls(e.target.value)} maxLength={20} autoComplete="off" className="field mb-6" placeholder="mis. X TKJ 2" />
          <Button type="submit" variant="primary" size="lg" className="w-full">Lanjut ke tutorial</Button>
        </form>

        <section aria-label="Siswa di perangkat ini">
          <div className="flex items-end justify-between border-b border-cream-100/60 pb-2">
            <h2 className="text-xl font-bold">Siswa di perangkat ini</h2>
            <span className="docno">{pad2(list.length)} BERKAS</span>
          </div>
          <p className="mt-2 text-xs text-cream-300">Data tersimpan lokal di browser ini. Pilih nama untuk melanjutkan.</p>
          {list.length === 0 ? <p className="py-6 text-sm text-cream-300">Belum ada siswa.</p> : (
            <ul className="mt-2">
              {list.map((p) => (
                <li key={p.id} className="border-b border-ink-600">
                  <button onClick={() => { select(p.id); nav('/cases') }} className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-2 py-3 text-left hover:bg-ink-800">
                    <span className="min-w-0"><span className="block truncate font-semibold">{p.name}</span><span className="docno">{p.className || 'TANPA KELAS'} · {pad2(completedCount(p))}/{pad2(CASES.length)} KASUS</span></span>
                    <span className="font-mono text-sm text-gold-400">{totalXp(p).toLocaleString('id-ID')} XP</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </>
  )
}
