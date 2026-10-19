import { Pin, PinOff } from 'lucide-react'
import type { Clue } from '../../types'
import { pad2 } from '../../utils/arabic'
import { EntityGlyph } from '../game/EntityIcon'
import { Ar } from '../common/RichText'

interface Props {
  clue: Clue
  index: number
  note?: boolean
  selected?: boolean
  muted?: boolean
  pinned?: boolean
  onPin?: () => void
  onClick?: () => void
  compact?: boolean
  badge?: string
  className?: string
}

/** Evidence slip: evidence code (E-03) + Arabic clue + object glyph. Selected = amber frame; the code makes every clue citable. */
export function EvidenceCard({ clue, index, note, selected, muted, pinned, onPin, onClick, compact, badge, className = '' }: Props) {
  const Tag = onClick ? 'button' : 'div'
  return (
    <div className={`relative ${muted ? 'opacity-55' : ''} ${className}`}>
      <Tag
        {...(onClick ? { onClick, type: 'button' as const, 'aria-pressed': selected } : {})}
        className={`paper block w-full border-l-[3px] border-l-coral px-3 py-2 text-left ${compact ? '' : 'sm:px-4 sm:py-3'} ${selected ? 'outline outline-2 outline-offset-1 outline-gold-500' : ''} ${onClick ? 'tap hover:bg-cream-50' : ''}`}
      >
        <span className="mb-0.5 flex items-center justify-between gap-2">
          <span className="docno">E-{pad2(index)}</span>
          <span className="flex items-center gap-1.5">
            {badge && <span className="stamp stamp-amber !px-1.5 !py-0 !text-micro">{badge}</span>}
            {clue.entity && <EntityGlyph kind={clue.entity} size={22} />}
          </span>
        </span>
        <Ar size={compact ? 'sm' : 'md'} className="block text-ink-900">{clue.ar}</Ar>
        {note && <span className="mt-0.5 block text-xs text-ink-600">{clue.note}</span>}
      </Tag>
      {onPin && (
        <button onClick={onPin} aria-pressed={pinned} aria-label={pinned ? 'Lepas sematan' : 'Sematkan bukti kunci'}
          className={`tap absolute -right-2 -top-2 grid h-9 w-9 place-items-center rounded-lg border ${pinned ? 'border-gold-400 bg-gold-500 text-on-accent' : 'border-ink-500 bg-ink-800 text-cream-200'}`}>
          {pinned ? <Pin size={16} /> : <PinOff size={16} />}
        </button>
      )}
    </div>
  )
}
