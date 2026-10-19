import { useCallback, useEffect, useMemo, useState } from 'react'
import { Download, RefreshCw } from 'lucide-react'
import { Button } from '../components/common/Button'
import { Sheet } from '../components/common/Sheet'
import { Ar } from '../components/common/RichText'
import { TopBar } from '../components/common/TopBar'
import { CASES } from '../data/cases'
import {
  cloudEnabled, fetchTeacherAttempts, signInTeacher, signOutTeacher, teacherSession, TeacherAuthError, TEACHER_FETCH_LIMIT,
  type TeacherAttempt,
} from '../services/cloud/supabase'
import { attemptsToCsv, filterAttempts, hardVocabLabel, readDetails, studentProgress } from '../engine/teacherView'
import { formatDuration } from '../utils/format'

const when = (iso: string) => { const d = new Date(iso); return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) }
const input = 'field'
const stars = (n: number) => '★'.repeat(Math.max(0, Math.min(3, n))) + '☆'.repeat(3 - Math.max(0, Math.min(3, n)))

function Stat({ k, v }: { k: string; v: string | number }) {
  return <div className="px-4 py-2.5"><dt className="label">{k}</dt><dd className="font-mono text-xl font-medium tabular-nums">{v}</dd></div>
}

function Detail({ a, all }: { a: TeacherAttempt; all: TeacherAttempt[] }) {
  const d = readDetails(a.details)
  const prog = studentProgress(all, a.students?.client_id, CASES.length)
  const cells: [string, React.ReactNode][] = [
    ['Nilai', <b className="text-xl text-gold-400">{a.score}</b>], ['Akurasi', `${Math.round(a.accuracy * 100)}%`],
    ['Benar', <span className="text-good">{a.correct_count}</span>], ['Salah', <span className="text-bad">{a.mistake_count}</span>],
    ['Hint Dalil', a.hint_count], ['Bukti', `${a.evidence_found}/${a.evidence_total}`],
    ['XP', a.xp], ['Bintang', stars(a.stars)], ['Durasi', formatDuration(a.duration_ms)], ['Percobaan ke', a.attempt_number],
  ]
  return (
    <div>
      <p className="text-sm text-cream-300">{a.students?.class_name || 'Tanpa kelas'} · CASE {a.case_number} · {a.case_title}</p>
      <p className="text-xs text-cream-400">{when(a.finished_at)}</p>
      <div className="mt-2" aria-label={`Progres ${prog.done} dari ${prog.total} kasus`}>
        <div className="flex justify-between text-xs"><span>Progres siswa</span><span>{prog.done}/{prog.total} kasus</span></div>
        <div className="mt-1 h-2 overflow-hidden rounded-full bg-ink-600"><div className="h-full bg-gold-500" style={{ width: `${(prog.done / prog.total) * 100}%` }} /></div>
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        {cells.map(([k, v]) => <div key={k}><dt className="text-xs text-cream-400">{k}</dt><dd className="font-semibold">{v}</dd></div>)}
      </dl>
      <h3 className="mt-5 text-sm font-semibold">Kosakata paling sulit</h3>
      {d.vocab.filter((v) => v.w > 0).length === 0 ? <p className="mt-1 text-xs text-cream-300">Tidak ada kesalahan kosakata pada percobaan ini.</p> : (
        <ul className="mt-2 grid gap-1.5">
          {d.vocab.filter((v) => v.w > 0).slice(0, 5).map((v) => (
            <li key={v.id} className="flex items-center justify-between rounded-lg bg-ink-700/glass px-3 py-1.5"><Ar size="sm">{v.ar}</Ar><span className="text-xs"><span className="text-good">{v.c} benar</span> · <span className="text-bad">{v.w} salah</span></span></li>
          ))}
        </ul>
      )}
      {d.issues.length > 0 && (
        <>
          <h3 className="mt-5 text-sm font-semibold">Tugas yang butuh bantuan</h3>
          <ul className="mt-2 grid gap-1 text-xs">
            {d.issues.slice(0, 6).map((t) => <li key={t.taskId} className="flex justify-between rounded bg-ink-700/soft-sm px-3 py-1"><span>{t.taskId}</span><span>{t.mistakes} salah · {t.hints} hint</span></li>)}
          </ul>
        </>
      )}
    </div>
  )
}

export function Teacher() {
  const [session, setSession] = useState(() => teacherSession())
  const [attempts, setAttempts] = useState<TeacherAttempt[]>([])
  const [loaded, setLoaded] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [query, setQuery] = useState('')
  const [classFilter, setClassFilter] = useState('all')
  const [caseFilter, setCaseFilter] = useState('all')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const classes = useMemo(() => Array.from(new Set(attempts.map((x) => x.students?.class_name).filter((x): x is string => Boolean(x)))).sort(), [attempts])
  const filtered = useMemo(() => filterAttempts(attempts, { query, className: classFilter, caseId: caseFilter }), [attempts, query, classFilter, caseFilter])
  const selected = attempts.find((x) => x.id === selectedId) ?? null

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      setAttempts(await fetchTeacherAttempts()); setLoaded(true)
    } catch (e) {
      if (e instanceof TeacherAuthError) { setSession(null); setAttempts([]); setError(e.message) }
      else setError(e instanceof Error ? e.message : 'Gagal memuat data.')
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { if (session && cloudEnabled) void load() }, [session, load])

  async function login(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError('')
    try { const s = await signInTeacher(email.trim(), password); setPassword(''); setSession(s) }
    catch (err) { setError(err instanceof Error ? err.message : 'Login gagal.') }
    finally { setLoading(false) }
  }
  function logout() { signOutTeacher(); setSession(null); setAttempts([]); setSelectedId(null); setLoaded(false) }
  function exportCsv() {
    const blob = new Blob(['\ufeff' + attemptsToCsv(filtered)], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'arabic-detective-nilai.csv'; a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  if (!cloudEnabled) {
    return (
      <>
        <TopBar title="Dashboard Guru" back="/" />
        <main className="mx-auto max-w-2xl px-4 py-8">
          <section className="panel p-6">
            <h1 className="text-xl font-bold">Cloud belum diaktifkan</h1>
            <p className="mt-2 text-sm text-cream-300">Game tetap berjalan penuh tanpa cloud. Untuk dashboard guru, isi <code>VITE_SUPABASE_URL</code> dan <code>VITE_SUPABASE_ANON_KEY</code> di Environment Variables, lalu build ulang. Panduan: <code>supabase/README.md</code>.</p>
          </section>
        </main>
      </>
    )
  }

  if (!session) {
    return (
      <>
        <TopBar title="Login Guru" back="/" />
        <main className="mx-auto max-w-md px-4 py-10">
          <form onSubmit={login} className="panel p-6">
            <div className="mb-5"><p className="docno">AKSES GURU</p><h1 className="text-xl font-bold">Dashboard Guru</h1><p className="text-xs text-cream-300">Masuk dengan akun guru.</p></div>
            <label htmlFor="teacher-email" className="mb-1 block text-sm font-medium">Email</label>
            <input id="teacher-email" type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} className={`${input} mb-4`} />
            <label htmlFor="teacher-password" className="mb-1 block text-sm font-medium">Password</label>
            <input id="teacher-password" type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className={`${input} mb-2`} />
            <p className="mb-3 min-h-[1.25rem] text-sm text-bad" role="alert">{error}</p>
            <Button type="submit" variant="primary" size="lg" className="w-full" disabled={loading}>{loading ? 'Memeriksa…' : 'Masuk'}</Button>
          </form>
        </main>
      </>
    )
  }

  const avg = (f: (a: TeacherAttempt) => number) => filtered.length ? filtered.reduce((s, x) => s + f(x), 0) / filtered.length : 0
  return (
    <>
      <TopBar title="Dashboard Guru" back="/"
        right={<div className="flex gap-2">
          <Button size="sm" aria-label="Muat ulang" icon={<RefreshCw size={16} className={loading ? 'animate-spin' : ''} />} onClick={() => void load()} disabled={loading}><span className="hidden sm:inline">Muat ulang</span></Button>
          <Button size="sm" onClick={logout}>Keluar</Button>
        </div>} />
      <main className="mx-auto max-w-page px-3 py-5 sm:px-4 lg:px-8">
        <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-[minmax(0,1fr)_180px_240px_auto]">
          <input aria-label="Cari" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari nama, kelas, atau kasus…" className={`${input} col-span-2 lg:col-span-1`} />
          <select aria-label="Filter kelas" value={classFilter} onChange={(e) => setClassFilter(e.target.value)} className={input}>
            <option value="all">Semua kelas</option>{classes.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select aria-label="Filter kasus" value={caseFilter} onChange={(e) => setCaseFilter(e.target.value)} className={input}>
            <option value="all">Semua kasus</option>{CASES.map((c) => <option key={c.id} value={c.id}>CASE {c.number} · {c.titleId}</option>)}
          </select>
          <Button className="col-span-2 lg:col-span-1" icon={<Download size={16} />} onClick={exportCsv} disabled={!filtered.length}>Ekspor CSV</Button>
        </div>

        {error && (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border border-l-4 border-ink-600 border-l-bad bg-ink-800 px-3 py-2 text-sm text-bad" role="alert">
            <span>{error}</span><Button size="sm" onClick={() => void load()} disabled={loading}>Coba lagi</Button>
          </div>
        )}
        {attempts.length >= TEACHER_FETCH_LIMIT && <p className="mb-3 text-xs text-amber-300">Menampilkan {TEACHER_FETCH_LIMIT} pengerjaan terbaru. Gunakan filter untuk mempersempit.</p>}

        <dl className="mb-4 grid grid-cols-2 divide-ink-600 border-y border-ink-600 sm:grid-cols-5 sm:divide-x [&>div:nth-child(n+3)]:border-t [&>div:nth-child(n+3)]:border-ink-600 sm:[&>div:nth-child(n+3)]:border-t-0">
          <Stat k="Pengerjaan" v={filtered.length} />
          <Stat k="Siswa unik" v={new Set(filtered.map((x) => x.students?.client_id).filter(Boolean)).size} />
          <Stat k="Rata-rata nilai" v={filtered.length ? Math.round(avg((x) => x.score)) : '—'} />
          <Stat k="Rata-rata hint" v={filtered.length ? avg((x) => x.hint_count).toFixed(1) : '—'} />
          <Stat k="Rata-rata durasi" v={filtered.length ? formatDuration(avg((x) => x.duration_ms)) : '—'} />
        </dl>

        {loading && !loaded && <p className="panel p-8 text-center text-cream-300" role="status">Memuat data siswa…</p>}
        {loaded && attempts.length === 0 && <p className="panel p-8 text-center text-cream-300">Belum ada hasil siswa. Hasil muncul setelah siswa menyelesaikan satu kasus dengan koneksi internet.</p>}
        {loaded && attempts.length > 0 && filtered.length === 0 && <p className="panel p-8 text-center text-cream-300">Tidak ada data yang cocok dengan filter.</p>}

        {filtered.length > 0 && (
          <>
            {/* mobile / tablet portrait: cards */}
            <ul className="grid gap-3 md:grid-cols-2 lg:hidden" aria-label="Daftar pengerjaan">
              {filtered.map((a) => (
                <li key={a.id}>
                  <button className="panel tap block w-full border-l-2 border-l-gold-500 p-3 text-left hover:bg-ink-700" onClick={() => setSelectedId(a.id)}>
                    <span className="flex items-start justify-between gap-3">
                      <span className="min-w-0"><span className="block truncate font-semibold">{a.students?.name || '—'}</span><span className="block text-xs text-cream-400">{a.students?.class_name || 'Tanpa kelas'} · CASE {a.case_number}</span></span>
                      <span className="font-mono text-2xl font-medium text-gold-400">{a.score}</span>
                    </span>
                    <span className="mt-2 grid grid-cols-4 gap-2 text-xs text-cream-300">
                      <span><b className="text-good">{a.correct_count}</b> benar</span><span><b className="text-bad">{a.mistake_count}</b> salah</span>
                      <span><b>{a.hint_count}</b> hint</span><span>{formatDuration(a.duration_ms)}</span>
                    </span>
                    {hardVocabLabel(a.details) && <span className="mt-1 block text-xs text-cream-400">Sulit: <Ar size="sm">{hardVocabLabel(a.details)}</Ar></span>}
                  </button>
                </li>
              ))}
            </ul>
            {/* desktop: table */}
            <section className="hidden border border-ink-600 lg:block">
              <div>
                <table className="w-full text-left text-sm">
                  <thead className="sticky top-12 z-10 bg-ink-950 [&_th]:label [&_th]:border-b [&_th]:border-ink-600"><tr>
                    <th scope="col" className="p-3">Siswa</th><th scope="col" className="p-3">Kasus</th><th scope="col" className="p-3 text-right">Nilai</th><th scope="col" className="p-3 text-right">Benar/Salah</th>
                    <th scope="col" className="p-3 text-right">Hint</th><th scope="col" className="p-3">Bintang</th><th scope="col" className="hidden p-3 xl:table-cell">Bukti</th><th scope="col" className="p-3 text-right">Durasi</th><th scope="col" className="hidden p-3 xl:table-cell">Selesai</th>
                  </tr></thead>
                  <tbody>
                    {filtered.map((a) => (
                      <tr key={a.id} className="cursor-pointer border-t border-ink-600 hover:bg-ink-800" onClick={() => setSelectedId(a.id)}>
                        <td className="p-0"><button className="tap w-full px-3 py-2 text-left" onClick={(e) => { e.stopPropagation(); setSelectedId(a.id) }}><span className="block font-semibold">{a.students?.name || '—'}</span><span className="text-xs text-cream-400">{a.students?.class_name || 'Tanpa kelas'}</span></button></td>
                        <td className="p-3"><span className="font-medium">{a.case_number}. {a.case_title}</span><span className="block text-xs text-cream-400">Percobaan ke-{a.attempt_number}</span></td>
                        <td className="p-3 text-right font-mono text-lg font-medium text-gold-400">{a.score}</td>
                        <td className="p-3 text-right tabular-nums"><span className="text-good">{a.correct_count}</span> / <span className="text-bad">{a.mistake_count}</span></td>
                        <td className="p-3 text-right tabular-nums">{a.hint_count}</td>
                        <td className="p-3 text-gold-400" aria-label={`${a.stars} bintang`}>{stars(a.stars)}</td>
                        <td className="hidden p-3 font-mono xl:table-cell">{a.evidence_found}/{a.evidence_total}</td>
                        <td className="p-3 text-right tabular-nums">{formatDuration(a.duration_ms)}</td>
                        <td className="hidden p-3 text-xs text-cream-300 xl:table-cell">{when(a.finished_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </main>
      <Sheet open={Boolean(selected)} onClose={() => setSelectedId(null)} title={selected?.students?.name || 'Detail pengerjaan'}>
        {selected && <Detail a={selected} all={attempts} />}
      </Sheet>
    </>
  )
}
