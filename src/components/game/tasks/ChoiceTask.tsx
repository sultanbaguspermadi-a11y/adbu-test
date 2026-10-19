import { useState } from 'react'
import type { ChoiceTask as T } from '../../../types'
import { Button } from '../../common/Button'
import { Ar } from '../../common/RichText'
import { ChoiceVisual } from '../ChoiceVisual'
import { FeedbackBanner } from '../FeedbackBanner'
import { TaskPrompt, useFb, useTaskActions } from './common'
import type { TaskProps } from './common'

/** Pick the Arabic phrase or sentence that matches the picture. */
export function ChoiceTask({ task, solved, onSolved }: TaskProps<T>) {
  const { mistake, focus } = useTaskActions(task)
  const [sel, setSel] = useState<string | null>(null)
  const [fb, setFb] = useFb()

  function submit() {
    if (!sel) { setFb({ kind: 'info', text: 'Pilih salah satu jawaban dulu.' }); return }
    if (sel === task.correct) { onSolved(); return }
    const msg = `Belum tepat. ${task.wrongNotes[sel] ?? 'Cocokkan bentuk kata dengan gambar.'}`
    mistake(msg)
    setFb({ kind: 'bad', text: msg })
  }

  return (
    <div>
      <TaskPrompt instruction={task.instruction} />
      {task.promptAr && <div className="paper mb-3 px-4 py-3 text-center"><Ar size="lg" className="block text-ink-900">{task.promptAr}</Ar></div>}
      <div className="paper mb-3 flex justify-center px-3 py-2" style={{ borderBottom: '3px solid rgb(var(--c-district))' }}><ChoiceVisual visual={task.visual} /></div>
      <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Pilihan jawaban">
        {task.options.map((o) => (
          <button key={o.id} role="radio" aria-checked={sel === o.id} disabled={solved} onClick={() => { setSel(o.id); focus(o.ar) }}
            className={`tap rounded-lg border px-3 py-2.5 text-center transition-colors ${sel === o.id ? 'border-gold-400 bg-ink-700' : 'border-ink-600 bg-ink-800 hover:border-ink-400'} ${solved && o.id === task.correct ? '!border-good' : ''}`}>
            <Ar size="md" className="block text-cream-100">{o.ar}</Ar>
          </button>
        ))}
      </div>
      <div className="mt-3 flex flex-col gap-3">
        <FeedbackBanner feedback={solved ? { kind: 'good', text: task.success } : fb} />
        {!solved && <Button variant="primary" onClick={submit}>Periksa jawaban</Button>}
      </div>
    </div>
  )
}
