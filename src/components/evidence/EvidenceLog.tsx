import { useRef } from 'react'
import type { CaseDefinition } from '../../types'
import { clueNumber, evidenceTotal } from '../../data/cases'
import { pad2 } from '../../utils/arabic'
import { useGameStore } from '../../stores/gameStore'
import { Ar } from '../common/RichText'

/** Live evidence register (right column). Newly found items pulse once so the finding is noticed; nothing else moves. */
export function EvidenceLog({ def, className = '' }: { def: CaseDefinition; className?: string }) {
  const s = useGameStore((x) => x.session)
  const found = def.clues.filter((c) => c.isEvidence && s?.evidence.includes(c.id))
  const initial = useRef<Set<string>>(new Set(found.map((c) => c.id)))
  const total = evidenceTotal(def)
  return (
    <section className={className} aria-label="Bukti terkumpul">
      <div className="flex items-baseline justify-between border-b border-ink-600 pb-1.5">
        <h3 className="label !text-cream-100">Bukti terkumpul</h3>
        <span className="docno" aria-label={`${found.length} dari ${total} bukti`}>{pad2(found.length)}/{pad2(total)}</span>
      </div>
      {found.length === 0 ? (
        <p className="py-3 text-xs text-cream-300">Belum ada bukti. Selesaikan tugas untuk mengumpulkannya.</p>
      ) : (
        <ol className="mt-2 flex flex-col gap-1.5">
          {found.map((c) => (
            <li key={c.id} className={`border border-ink-600 border-l-2 border-l-coral bg-ink-800 px-2.5 py-1.5 ${initial.current.has(c.id) ? '' : 'found-pulse'}`}>
              <span className="docno">E-{pad2(clueNumber(def, c.id))}</span>
              <Ar size="sm" className="block leading-snug">{c.ar}</Ar>
              {s?.revealed.includes(c.id) && <span className="block text-xs text-cream-300">{c.note}</span>}
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
