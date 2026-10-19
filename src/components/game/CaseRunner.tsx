import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { BookOpenText, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { CaseDefinition } from '../../types'
import { evidenceTotal } from '../../data/cases'
import { Button } from '../common/Button'
import { Ar } from '../common/RichText'
import { DalilPanel, FieldNotes } from '../dalil/DalilPanel'
import { EvidenceLog } from '../evidence/EvidenceLog'
import { NotesSheet } from '../evidence/NotesSheet'
import { useGameStore } from '../../stores/gameStore'
import { FeedbackBanner } from './FeedbackBanner'
import { HudBar } from './HudBar'
import { MissionBrief } from './MissionBrief'
import { TaskView } from './tasks'

interface Props { def: CaseDefinition; onFinish: () => void; onRestart: () => void }

/**
 * Investigation workspace, one layout for every district.
 *   HUD (where you are) → mission brief (what to do) → stage (the scene / task, the focal point) → rail (evidence + Dalil).
 * ≥1024px: stage + right rail. <1024px: a single column with a bottom dock that opens Dalil and the case notes as sheets.
 */
export function CaseRunner({ def, onFinish, onRestart }: Props) {
  const nav = useNavigate()
  const session = useGameStore((s) => s.session)!
  const completeTask = useGameStore((s) => s.completeTask)
  const advance = useGameStore((s) => s.advance)
  const [dalil, setDalil] = useState(false)
  const [notes, setNotes] = useState(false)
  const [gain, setGain] = useState<{ xp: number; key: number } | null>(null)
  const [msg, setMsg] = useState<string | undefined>()

  const idx = Math.min(session.taskIndex, def.tasks.length - 1)
  const task = def.tasks[idx]
  const solved = Boolean(session.taskStats[task.id]?.done)
  const last = idx === def.tasks.length - 1
  const evFound = session.evidence.filter((id) => def.clues.find((c) => c.id === id)?.isEvidence).length

  function onSolved(text?: string) {
    const { xpGain } = completeTask(task)
    setMsg(text)
    if (xpGain > 0) setGain({ xp: xpGain, key: Date.now() })
  }
  function next() {
    setGain(null); setMsg(undefined)
    if (advance(def) === 'finished') onFinish()
  }

  return (
    <div data-district={def.theme} className="district-wash min-h-screen pb-28 lg:pb-24 short:pb-16">
      <HudBar def={def} idx={idx} solved={solved} xp={session.xp} evFound={evFound} evTotal={evidenceTotal(def)} onBack={() => nav('/cases')} onDalil={() => setDalil(true)} onNotes={() => setNotes(true)} />

      {/* grid: <lg one column (brief, task); lg brief+task | rail; short landscape task | brief + tools */}
      <div className="mx-auto grid max-w-page grid-cols-1 content-start gap-x-6 px-3 py-4 sm:px-4 lg:grid-cols-[minmax(0,1fr)_320px] lg:px-8 lg:py-6 2xl:grid-cols-[minmax(0,1fr)_360px] short:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] short:gap-x-4 short:py-2">
        <MissionBrief def={def} task={task} idx={idx} learned={session.learned} className="lg:col-start-1 lg:row-start-1 short:col-start-2 short:row-start-1 short:self-start" />

        <main className="min-w-0 lg:col-start-1 lg:row-start-2 short:col-start-1 short:row-span-3 short:row-start-1" aria-label="Tugas">
          <AnimatePresence mode="wait">
            <motion.section key={task.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}>
              <TaskView task={task} def={def} solved={solved} onSolved={onSolved} />
              {solved && msg && <div className="mt-3"><FeedbackBanner feedback={{ kind: 'good', text: msg }} /></div>}
            </motion.section>
          </AnimatePresence>
        </main>

        <aside className="hidden lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:sticky lg:top-[72px] lg:flex lg:max-h-[calc(100vh-88px)] lg:flex-col lg:gap-4 lg:self-start" aria-label="Bukti dan catatan">
          <EvidenceLog def={def} className="max-h-[32vh] shrink-0 overflow-y-auto" />
          <FieldNotes def={def} task={task} className="min-h-0 flex-1 overflow-y-auto" />
          <Button size="sm" onClick={() => setNotes(true)}>Buka catatan kasus</Button>
        </aside>

        {/* phone / tablet tools: a fixed dock, or (landscape phone) a block under the brief */}
        {!solved && (
          <nav className="dock short:static short:col-start-2 short:row-start-2 short:mt-2 short:border-0 short:bg-transparent short:pb-0 short:!flex" aria-label="Alat penyelidikan">
            <div className="mx-auto grid w-full max-w-page grid-cols-2 gap-2 px-3 py-2 short:px-0 short:py-0">
              <button onClick={() => setNotes(true)} className="tap inline-flex items-center justify-center gap-2 rounded-lg border border-cream-300/40 px-3 text-small font-semibold uppercase tracking-[.07em] text-cream-100 hover:bg-ink-700"><BookOpenText size={18} aria-hidden />Bukti {evFound}/{evidenceTotal(def)}</button>
              <button onClick={() => setDalil(true)} className="tap inline-flex items-center justify-center gap-2 rounded-lg border border-gold-500/70 px-3 text-small font-semibold uppercase tracking-[.07em] text-gold-400 hover:bg-ink-800"><Search size={18} aria-hidden />Dalil</button>
            </div>
          </nav>
        )}
      </div>

      <AnimatePresence>
        {solved && (
          <motion.div initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
            className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-gold-500 bg-ink-950 pb-[env(safe-area-inset-bottom)]">
            <div className="mx-auto flex max-w-page items-center justify-between gap-3 px-3 py-2.5 sm:px-4 lg:px-8">
              <div className="flex items-center gap-3">
                <span className="stamp stamp-green stamp-in">Terverifikasi</span>
                <span className="hidden sm:block">
                  <Ar size="cue" className="leading-none text-good">أَحْسَنْتَ!</Ar>
                  {gain && <motion.span key={gain.key} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="ml-3 font-mono text-sm text-gold-400">+{gain.xp} XP{gain.xp > 100 && <span className="ml-1 text-xs text-cream-300">(tanpa petunjuk)</span>}</motion.span>}
                </span>
                {gain && <span className="font-mono text-sm text-gold-400 sm:hidden">+{gain.xp} XP</span>}
              </div>
              <Button variant="primary" size="lg" onClick={next}>{last ? 'Tutup kasus' : 'Lanjutkan investigasi'}</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <DalilPanel open={dalil} onClose={() => setDalil(false)} def={def} task={task} />
      <NotesSheet open={notes} onClose={() => setNotes(false)} def={def} onRestart={() => { setNotes(false); onRestart() }} />
    </div>
  )
}
