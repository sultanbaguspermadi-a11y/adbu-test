import { ArrowLeft, BookOpenText, Search } from 'lucide-react'
import type { CaseDefinition } from '../../types'
import { THEMES, caseCode } from '../../themes/registry'
import { pad2 } from '../../utils/arabic'
import { Ar } from '../common/RichText'

interface Props {
  def: CaseDefinition
  /** Index of the current task and whether it is solved. */
  idx: number
  solved: boolean
  xp: number
  evFound: number
  evTotal: number
  onBack: () => void
  onDalil: () => void
  onNotes: () => void
}

/** Single-row heads-up display: where you are (district · case · mission) and what you have (XP, evidence). */
export function HudBar({ def, idx, solved, xp, evFound, evTotal, onBack, onDalil, onNotes }: Props) {
  const theme = THEMES[def.theme]
  return (
    <header className="hud">
      <div className="mx-auto flex h-14 max-w-page items-center gap-2 px-3 sm:gap-3 sm:px-4 lg:px-8 short:h-11">
        <button onClick={onBack} className="tap -ml-2 inline-flex items-center gap-1.5 px-2 text-cream-300 hover:text-cream-100" aria-label="Keluar ke daftar kasus">
          <ArrowLeft size={18} aria-hidden /><span className="hidden font-mono text-xs uppercase tracking-[.12em] sm:inline">Berkas</span>
        </button>
        <span className="district-chip hidden sm:inline-flex">{theme.docLabel} · {caseCode(def)}</span>
        <p className="min-w-0 flex-1 truncate text-sm sm:text-base">
          <span className="font-semibold text-cream-100">{def.titleId}</span>
          <Ar size="sm" className="ml-2 hidden !leading-none text-cream-300 lg:inline">{def.titleAr}</Ar>
        </p>
        <ol className="hidden items-center gap-1 md:flex" role="progressbar" aria-valuemin={0} aria-valuemax={def.tasks.length} aria-valuenow={idx + (solved ? 1 : 0)} aria-label="Kemajuan kasus">
          {def.tasks.map((t, i) => {
            const done = i < idx || (i === idx && solved)
            return (
              <li key={t.id} title={`${pad2(i + 1)} · ${t.titleId}`}
                className={`grid h-6 min-w-[1.75rem] place-items-center rounded-sm border px-1 font-mono text-tiny ${done ? 'border-gold-500 bg-gold-500 text-on-accent' : i === idx ? 'border-district text-district' : 'border-ink-500 text-ink-400'}`}>
                {pad2(i + 1)}
              </li>
            )
          })}
        </ol>
        <span className="docno hidden tabular-nums lg:inline" title="XP kasus ini">{xp} XP</span>
        <button onClick={onNotes} className="tap hidden items-center gap-1.5 px-2 font-mono text-xs uppercase tracking-[.1em] text-cream-300 hover:text-cream-100 sm:inline-flex lg:hidden short:!hidden" aria-label="Buka catatan kasus">
          <BookOpenText size={16} aria-hidden />{evFound}/{evTotal}
        </button>
        <button onClick={onDalil} className="tap hidden items-center gap-1.5 rounded-lg border border-gold-500/70 px-2.5 font-mono text-xs uppercase tracking-[.1em] text-gold-400 hover:bg-ink-800 sm:inline-flex lg:hidden short:!hidden" aria-label="Buka catatan lapangan Dalil">
          <Search size={16} aria-hidden />Dalil
        </button>
      </div>
      {/* phone: thin progress strip under the bar */}
      <div className="flex h-1 gap-px md:hidden" aria-hidden>
        {def.tasks.map((t, i) => <span key={t.id} className={`flex-1 ${i < idx || (i === idx && solved) ? 'bg-gold-500' : i === idx ? 'bg-district/60' : 'bg-ink-600'}`} />)}
      </div>
    </header>
  )
}
