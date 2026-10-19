import type { EntityKind } from '../../types'
import { getVocab } from '../../data/vocabulary'
import { EntityShape } from './EntityIcon'
import type { MarkState } from './sceneProps'

/** One interactive entity in a scene: glyph, hover ring, selection/found marks and the optional Arabic label. */
export function SceneHotspot({ kind, cx, by, s, mark, label, disabled, showLabel, onSelect }: {
  kind: EntityKind; cx: number; by: number; s: number
  mark?: MarkState; label: string; disabled?: boolean; showLabel: boolean
  onSelect: (k: EntityKind) => void
}) {
  const x = cx - s / 2
  const y = by - s + (s * 4) / 64
  return (
    <g
      className="hotspot" role="button" tabIndex={disabled ? -1 : 0} aria-label={label}
      aria-disabled={disabled} onClick={() => !disabled && onSelect(kind)}
      onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && !disabled) { e.preventDefault(); onSelect(kind) } }}
      opacity={mark === 'ignored' ? 0.45 : 1}
    >
      <g transform={`translate(${x} ${y}) scale(${s / 64})`}><EntityShape kind={kind} /></g>
      <rect className="hs-ring" x={x - 2} y={y - 2} width={s + 4} height={s + 4} rx="8" fill="rgba(245,191,79,.08)" stroke="#F5BF4F" strokeWidth="2.5" strokeDasharray="6 4" />
      {mark === 'selected' && <rect x={x - 2} y={y - 2} width={s + 4} height={s + 4} rx="8" fill="none" stroke="#38BDF8" strokeWidth="3" />}
      {(mark === 'found' || mark === 'saved') && (
        <g transform={`translate(${x + s - 6} ${y + 6})`}>
          <circle r="11" fill="#34D399" stroke="#0B1B2E" strokeWidth="2" />
          <path d="M-5 0 L-1.5 4 L5 -4" stroke="#0B1B2E" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      )}
      {showLabel && (
        <text x={cx} y={by + 16} textAnchor="middle" fontSize="17" fill="#F6EEDC" stroke="#0B1B2E" strokeWidth="4" paintOrder="stroke" style={{ fontFamily: "'Noto Naskh Arabic', Amiri, serif" }}>
          {getVocab(kind)!.ar}
        </text>
      )}
    </g>
  )
}
