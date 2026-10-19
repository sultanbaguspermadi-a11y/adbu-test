import type { CaseDefinition, Task } from '../../types'
import { getLexeme } from '../../data/vocabulary'
import { pad2 } from '../../utils/arabic'
import { Ar, RichText } from '../common/RichText'

interface Props { def: CaseDefinition; task: Task; idx: number; learned: string[]; className?: string }

/** What to do now: mission number, title, the instruction, and the words this mission uses. Always visible, at every size. */
export function MissionBrief({ def, task, idx, learned, className = '' }: Props) {
  const vocab = task.vocab.flatMap((id) => {
    const v = getLexeme(id)
    return v ? [{ id, v }] : []
  })
  return (
    <section className={`brief mb-3 p-3 sm:p-4 short:mb-0 short:p-2.5 ${className}`} aria-label={`Misi ${idx + 1}`}>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
        <span className="docno !text-district">MISI {pad2(idx + 1)} / {pad2(def.tasks.length)}</span>
        <h2 className="text-lg font-bold leading-tight sm:text-xl short:text-base">{task.titleId}</h2>
      </div>
      <p className="mt-1.5 text-body leading-relaxed text-cream-100 short:text-small"><RichText text={task.instruction} /></p>
      {vocab.length > 0 && (
        <ul className="mt-2.5 flex flex-wrap gap-1.5 short:mt-1.5" aria-label="Kosakata misi">
          {vocab.map(({ id, v }) => {
            const known = def.showVocabMeaning || learned.includes(id)
            return <li key={id} className="chip !normal-case !tracking-normal"><Ar size="sm" className="!leading-snug">{v.ar}</Ar>{known && <span className="text-xs">{v.idn}</span>}</li>
          })}
        </ul>
      )}
    </section>
  )
}
