import { useState } from 'react'
import { Sheet } from '../common/Sheet'
import { RichText, Ar } from '../common/RichText'
import { Button } from '../common/Button'
import { askDalil, CHARGED_ACTIONS, resolveHintLevel } from '../../services/dalil'
import type { DalilAction, DalilContext, HintLevel } from '../../services/dalil'
import { useGameStore } from '../../stores/gameStore'
import { glossSentence } from '../../data/lexicon'
import { evidenceTotal, getClue } from '../../data/cases'
import type { CaseDefinition, Task } from '../../types'

/** Field-notes mark: the survey reticle with an Arabic lamp-dot, in the same ink/amber as the rest of the file. */
export function DalilMark({ size = 36 }: { size?: number }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="4" y="4" width="24" height="24" rx="2" />
      <path d="M10 12h12M10 16h12M10 20h7" />
    </svg>
  )
}

interface Props { open: boolean; onClose: () => void; def: CaseDefinition; task: Task }

function buildContext(def: CaseDefinition, task: Task, level: HintLevel, repeat: boolean): DalilContext {
  const g = useGameStore.getState()
  const s = g.session
  const st = s?.taskStats[task.id]
  const ev = (s?.evidence ?? []).map((id) => getClue(def, id)).filter((c): c is NonNullable<typeof c> => Boolean(c && c.isEvidence))
  return {
    caseId: def.id, caseTitleId: def.titleId, taskId: task.id, taskType: task.type,
    taskIndex: s?.taskIndex ?? 0, taskCount: def.tasks.length, instruction: task.instruction, promptAr: task.promptAr,
    focusText: g.focusText ?? task.focusText ?? task.promptAr, hintLevel: level, hintRepeat: repeat,
    failedAttempts: st?.mistakes ?? 0, hintsUsedOnTask: st?.hints ?? 0,
    evidence: ev.map((c) => ({ id: c.id, ar: c.ar })), evidenceFound: ev.length, evidenceTotal: evidenceTotal(def),
    lastMistake: g.lastMistake && g.lastMistake.taskId === task.id ? { message: g.lastMistake.message, vocab: g.lastMistake.vocab } : undefined,
    authoredHints: task.hints,
  }
}

const TOOLS: { id: DalilAction | 'pickWord'; label: string }[] = [
  { id: 'explainSentence', label: 'Jelaskan kalimat' },
  { id: 'pickWord', label: 'Jelaskan kata' },
  { id: 'whyWrong', label: 'Kenapa salah?' },
  { id: 'analyzeEvidence', label: 'Analisis bukti' },
]

interface Entry { id: number; head: string; text: string }

/** Field notes: a tiered hint ledger, not a conversation. Newest note on top; the ladder (1/3 → 3/3) is always visible. */
export function FieldNotes({ def, task, className = '' }: { def: CaseDefinition; task: Task; className?: string }) {
  const log = useGameStore((s) => s.dalilLog)
  const push = useGameStore((s) => s.pushDalil)
  const registerHint = useGameStore((s) => s.registerHint)
  const focusText = useGameStore((s) => s.focusText)
  const stat = useGameStore((s) => s.session?.taskStats[task.id])
  const [wordMode, setWordMode] = useState(false)

  const hintsUsed = Math.min(3, stat?.ladder ?? 0)
  const sentence = focusText ?? task.focusText ?? task.promptAr
  const words = sentence ? glossSentence(sentence).map((g) => g.surface) : []

  const entries: Entry[] = []
  let head = ''
  for (const m of log) {
    if (m.role === 'user') head = m.text
    else { entries.unshift({ id: m.id, head: head || 'Catatan', text: m.text }); head = '' }
  }

  function run(action: DalilAction, userText: string, word?: string) {
    setWordMode(false)
    push({ role: 'user', text: userText })
    const st = useGameStore.getState().session?.taskStats[task.id]
    const { level, repeat } = resolveHintLevel(st?.ladder ?? 0, st?.mistakes ?? 0)
    const reply = askDalil(action, { ...buildContext(def, task, level, repeat), word })
    // A hint only costs something when it gives new information; reflective help is free.
    const charged = CHARGED_ACTIONS[action] && !(action === 'hint' && repeat)
    if (charged) registerHint(task.id, action === 'hint' ? level : undefined)
    push({ role: 'dalil', text: reply.text })
  }
  const onTool = (t: (typeof TOOLS)[number]) => {
    if (t.id === 'pickWord') {
      if (!sentence) { push({ role: 'dalil', text: 'Belum ada kalimat yang sedang kamu baca. Ketuk sebuah petunjuk dulu.' }); return }
      setWordMode((w) => !w)
      return
    }
    run(t.id, t.label)
  }
  const hintLabel = hintsUsed === 0 ? 'Beri petunjuk' : hintsUsed >= 3 ? 'Ulangi petunjuk terakhir' : 'Petunjuk berikutnya'

  return (
    <section className={`paper on-paper flex flex-col p-4 ${className}`} aria-label="Catatan lapangan Dalil">
      <header className="flex items-start justify-between gap-3">
        <div>
          <Ar size="md" className="ar-keep block leading-none text-gold-700">دَلِيل</Ar>
          <p className="label mt-1">Field notes</p>
        </div>
        <div className="text-right" aria-label={`Tingkat petunjuk ${hintsUsed} dari 3`}>
          <p className="docno !text-ink-900">PETUNJUK {hintsUsed} / 3</p>
          <div className="mt-1.5 flex justify-end gap-1">{[0, 1, 2].map((i) => <span key={i} className={`h-1.5 w-6 ${i < hintsUsed ? 'bg-gold-700' : 'bg-ink-900/20'}`} />)}</div>
        </div>
      </header>

      <div className="rule mt-3 min-h-[5.5rem] flex-1 overflow-y-auto pt-3" aria-live="polite">
        {entries.length === 0 ? (
          <p className="text-sm text-ink-600">Belum ada catatan. Minta petunjuk bila kesulitan: dari yang umum, lalu makin spesifik.</p>
        ) : (
          <ol className="flex flex-col gap-3">
            {entries.map((e, i) => (
              <li key={e.id} className={i === 0 ? '' : 'opacity-70'}>
                <p className="label">{e.head}</p>
                <p className={`leading-relaxed ${i === 0 ? 'text-body' : 'text-sm'}`}><RichText text={e.text} /></p>
              </li>
            ))}
          </ol>
        )}
      </div>

      {wordMode && (
        <div className="rule mt-3 pt-3">
          <p className="label mb-1.5">Pilih kata</p>
          <div className="flex flex-wrap gap-1.5">
            {words.map((w, i) => (
              <button key={i} onClick={() => run('explainWord', `Jelaskan kata: ${w}`, w)} className="tap rounded-lg border border-ink-900/40 px-3 hover:bg-ink-900/5"><Ar size="sm">{w}</Ar></button>
            ))}
          </div>
        </div>
      )}

      <div className="rule mt-3 grid gap-2 pt-3">
        <Button variant="primary" onClick={() => run('hint', 'Petunjuk')}>{hintLabel}</Button>
        <div className="grid grid-cols-2 gap-2">
          {TOOLS.map((t) => <Button key={t.id} size="sm" aria-pressed={t.id === 'pickWord' ? wordMode : undefined} onClick={() => onTool(t)}>{t.label}</Button>)}
        </div>
        <p className="text-tiny leading-snug text-ink-500">Tersusun sebelumnya, tanpa internet, tidak pernah memberi jawaban akhir. Petunjuk baru dan penjelasan kata mengurangi bintang; sisanya gratis.</p>
      </div>
    </section>
  )
}

/** Mobile/tablet container: the same notes in a bottom sheet. On desktop the notes are docked in the workspace instead. */
export function DalilPanel({ open, onClose, def, task }: Props) {
  return (
    <Sheet open={open} onClose={onClose} title="Asisten Dalil · petunjuk bertingkat">
      <FieldNotes def={def} task={task} className="-mx-1 border-0" />
    </Sheet>
  )
}
