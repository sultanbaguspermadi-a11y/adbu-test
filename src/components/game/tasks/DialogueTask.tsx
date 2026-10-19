import { useState } from 'react'
import type { DialogueTask as T } from '../../../types'
import { NAME_DEFINITE } from '../../../data/vocabulary'
import { clueNumber, getClue } from '../../../data/cases'
import { Button } from '../../common/Button'
import { Ar } from '../../common/RichText'
import { EntityGlyph } from '../EntityIcon'
import { FeedbackBanner } from '../FeedbackBanner'
import { TaskPrompt, useFb, useTaskActions } from './common'
import type { TaskProps } from './common'

export function DialogueTask({ task, def, solved, onSolved }: TaskProps<T>) {
  const { mistake, focus } = useTaskActions(task)
  const [marked, setMarked] = useState<Set<string>>(new Set())
  const [fb, setFb] = useFb()

  const toggle = (id: string) => {
    if (solved) return
    setMarked((m) => { const n = new Set(m); if (n.has(id)) n.delete(id); else n.add(id); return n })
    const c = getClue(def, id)
    if (c) focus(c.ar)
  }

  function submit() {
    if (marked.size === 0) { setFb({ kind: 'info', text: 'Tandai dulu kalimat yang menurutmu penting.' }); return }
    const wrong = task.statementIds.find((id) => marked.has(id) && !task.relevant.includes(id))
    const missed = task.statementIds.find((id) => !marked.has(id) && task.relevant.includes(id))
    if (!wrong && !missed) { onSolved(); return }
    const msg = wrong
      ? `Belum tepat. ${task.reasons[wrong] ?? 'Kalimat itu tidak menjawab pertanyaan.'}`
      : 'Masih ada kalimat penting yang belum kamu tandai. Cari kalimat lain yang menyebut tokoh beserta tempatnya.'
    mistake(msg, wrong ? getClue(def, wrong)?.vocab.slice(0, 2) : task.vocab.slice(0, 2))
    setFb({ kind: 'bad', text: msg })
  }

  return (
    <div>
      <TaskPrompt instruction={task.instruction} />
      <p className="paper mb-4 px-4 py-2 text-sm font-semibold">{task.question}</p>
      <ul className="flex flex-col gap-3">
        {task.statementIds.map((id) => {
          const c = getClue(def, id)!
          const on = marked.has(id)
          const ok = solved && task.relevant.includes(id)
          return (
            <li key={id} className="flex items-stretch gap-3">
              <div className="flex w-16 shrink-0 flex-col items-center justify-center rounded-lg bg-ink-700 py-2">
                <EntityGlyph kind={c.speaker ?? 'officer'} size={40} />
                <Ar size="sm" className="text-cream-200 !leading-snug">{NAME_DEFINITE[c.speaker ?? 'officer']}</Ar>
              </div>
              <div className={`paper relative flex flex-1 flex-col gap-2 border-l-[3px] border-l-coral p-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 ${on ? 'outline outline-2 outline-offset-1 outline-gold-500' : ''}`}>
                <div className="min-w-0 flex-1">
                  <span className="docno">E-{String(clueNumber(def, id)).padStart(2, '0')}</span>
                  <Ar size="md" className="block text-ink-900">{c.ar}</Ar>
                  {solved && <span className="block text-xs text-ink-600">{c.note}{ok ? '' : ' — tidak relevan'}</span>}
                </div>
                <button onClick={() => toggle(id)} aria-pressed={on} disabled={solved}
                  className={`btn btn-sm shrink-0 ${on ? 'btn-primary' : 'btn-secondary'}`}>
                  {on ? 'Ditandai penting' : 'Tandai penting'}
                </button>
              </div>
            </li>
          )
        })}
      </ul>
      <div className="mt-3 flex flex-col gap-3">
        <FeedbackBanner feedback={solved ? { kind: 'good', text: task.success } : fb} />
        {!solved && <Button variant="primary" onClick={submit}>Simpan catatan saksi</Button>}
      </div>
    </div>
  )
}
