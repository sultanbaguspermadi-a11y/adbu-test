import { motion } from 'framer-motion'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { Button } from '../components/common/Button'
import { Ar } from '../components/common/RichText'
import { Stars } from '../components/common/Stars'
import { SyncNote } from '../components/common/SyncStatus'
import { TopBar } from '../components/common/TopBar'
import { getCase, nextCaseInTheme } from '../data/cases'
import { THEME_ORDER, THEMES, caseCode } from '../themes/registry'
import { labelOf } from '../data/vocabulary'
import { totalXp } from '../engine/analytics'
import { recommend } from '../engine/recommendation'
import { getRank } from '../engine/scoring'
import { useActivePlayer } from '../stores/playerStore'
import { pad2 } from '../utils/arabic'
import { formatDuration, pct } from '../utils/format'

/** Case closure report: the paper is the official summary; the desk side shows what to practise next. */
export function Results() {
  const { id } = useParams()
  const def = getCase(id)
  const player = useActivePlayer()!
  const nav = useNavigate()
  const r = def ? player.progress[def.id]?.lastResult : null
  if (!def || !r) return <Navigate to="/cases" replace />
  const next = nextCaseInTheme(def)
  const isFinal = !next
  /** Districts whose gate is this case (e.g. finishing Harbor case 2 opens Market). */
  const opened = THEME_ORDER.map((id) => THEMES[id]).filter((th) => th.unlockAfterCaseId === def.id)
  const { rank } = getRank(totalXp(player))
  const vocabRows = Object.entries(r.vocab)
    .map(([k, v]) => ({ k, ...v, l: labelOf(k) }))
    .filter((x) => x.l)
    .sort((a, b) => b.w - a.w || b.c - a.c)

  const rec = recommend(r)
  const attemptId = `${player.id}:${def.id}:${r.at}`
  const rows: [string, string][] = [
    ['Akurasi', pct(r.accuracy)], ['XP diperoleh', r.xp.toLocaleString('id-ID')], ['Bukti', `${r.evidenceFound}/${r.evidenceTotal}`],
    ['Petunjuk Dalil', String(r.hints)], ['Salah', String(r.mistakes)], ['Waktu', formatDuration(r.timeMs)],
  ]
  return (
    <>
      <TopBar title={`Laporan kasus · ${caseCode(def)}`} back="/cases" />
      <main data-district={def.theme} className="district-wash mx-auto grid max-w-page gap-6 px-4 py-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-10 lg:px-8 lg:py-10">
        <div>
          <article className="paper reg p-6 sm:p-8 lg:p-10" style={{ borderBottom: '4px solid rgb(var(--c-district))' }} aria-label="Laporan penutupan kasus">
            <div className="flex items-start justify-between gap-4">
              <p className="docno">LAPORAN PENUTUPAN · {caseCode(def)} · {THEMES[def.theme].docLabel}</p>
              <span className="stamp stamp-green stamp-in">Solved</span>
            </div>
            <Ar size="xl" className="mt-4 block text-left leading-tight">{def.titleAr}</Ar>
            <h2 className="text-xl font-bold tracking-tight">{def.titleId}</h2>

            <div className="rule mt-5 flex items-center gap-4 pt-4">
              <span className="label">Bintang</span>
              <span className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.span key={i} initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.25 + i * 0.18, type: 'spring', stiffness: 300, damping: 18 }}>
                    <Stars value={i < r.stars ? 1 : 0} max={1} size={34} />
                  </motion.span>
                ))}
              </span>
            </div>

            <dl className="mt-5 grid gap-x-8 sm:grid-cols-2">
              {rows.map(([k, v]) => (
                <div key={k} className="flex items-baseline justify-between border-b border-ink-900/15 py-2"><dt className="label">{k}</dt><dd className="font-mono text-xl font-medium tabular-nums">{v}</dd></div>
              ))}
            </dl>

            <div className="mt-6 border-l-2 border-gold-600 pl-4">
              <p className="label">Rekomendasi</p>
              <p className="mt-0.5 text-body font-medium leading-relaxed" data-testid="recommendation">{rec.text}</p>
            </div>
            {(r.firstClear && (next || opened.length > 0)) || isFinal ? (
              <div className="rule mt-5 flex flex-wrap items-center gap-3 pt-4 text-sm">
                {r.firstClear && opened.map((th) => <span key={th.id} className="flex items-center gap-2" data-testid="district-opened"><span className="stamp stamp-amber">Distrik baru terbuka</span><span className="font-semibold">{th.titleId}</span><Ar size="sm" className="text-ink-800">{th.titleAr}</Ar></span>)}
                {r.firstClear && next && <><span className="stamp stamp-amber">Berkas baru terbuka</span><span>CASE {pad2(next.number)} · {next.titleId}</span></>}
                {isFinal && <><span className="stamp stamp-amber">Peringkat</span><Ar size="sm" className="font-semibold">{rank.ar}</Ar><span className="text-ink-600">({rank.idn})</span></>}
              </div>
            ) : null}
          </article>
          <SyncNote attemptId={attemptId} />
        </div>

        <section aria-label="Performa kosakata" className="flex flex-col">
          <h3 className="label border-b border-ink-600 pb-1.5 !text-cream-100">Performa kosakata</h3>
          {rec.strong.length > 0 && <p className="mt-2 text-xs text-cream-300">Sudah dikuasai: {rec.strong.map((x) => <Ar key={x.id} size="sm" className="mx-1 text-good">{x.ar}</Ar>)}</p>}
          {vocabRows.length === 0 ? <p className="py-3 text-sm text-cream-300">Tidak ada data.</p> : (
            <ul className="mt-2">
              {vocabRows.map((v) => {
                const total = Math.max(1, v.c + v.w)
                return (
                  <li key={v.k} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 border-b border-ink-600 py-1.5 sm:grid-cols-[minmax(0,1fr)_72px_auto]">
                    <Ar size="sm" className="ar-keep min-w-0 text-left !leading-snug">{v.l!.ar}</Ar>
                    <span className="order-3 col-span-2 flex h-1.5 bg-ink-600 sm:order-none sm:col-span-1" aria-hidden><span className="bg-good" style={{ width: `${(v.c / total) * 100}%` }} /><span className="bg-coral" style={{ width: `${(v.w / total) * 100}%` }} /></span>
                    <span className="whitespace-nowrap text-right font-mono text-xs"><span className="text-good">{v.c} benar</span> · <span className={v.w ? 'text-bad' : 'text-cream-400'}>{v.w} salah</span></span>
                  </li>
                )
              })}
            </ul>
          )}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
            {next && <Button variant="primary" size="lg" className="sm:order-last lg:order-first xl:order-last" onClick={() => nav(`/case/${next.id}`)}>Kasus berikutnya</Button>}
            <Button onClick={() => nav(`/case/${def.id}`)}>Main lagi</Button>
            <Button onClick={() => nav('/cases')}>Kembali ke berkas</Button>
          </div>
        </section>
      </main>
    </>
  )
}
