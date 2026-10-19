import { ArrowLeft } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { totalXp } from '../../engine/analytics'
import { getRank } from '../../engine/scoring'
import { useActivePlayer } from '../../stores/playerStore'
import { Ar } from './RichText'

/** Survey reticle: a circle, crosshair and a bearing tick. It is the file's registration mark, not an icon. */
export function LogoMark({ size = 26 }: { size?: number }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="16" cy="16" r="9.5" />
      <path d="M16 2v8M16 22v8M2 16h8M22 16h8" />
      <circle cx="16" cy="16" r="2" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function Logo({ small = false }: { small?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5 text-gold-400">
      <LogoMark />
      {!small && <span className="hidden whitespace-nowrap font-mono text-small font-medium uppercase tracking-[.18em] text-cream-100 sm:inline">Arabic Detective</span>}
    </span>
  )
}

export function TopBar({ title, back, right }: { title?: string; back?: string; right?: ReactNode }) {
  const nav = useNavigate()
  const player = useActivePlayer()
  const xp = player ? totalXp(player) : 0
  const { rank } = getRank(xp)
  return (
    <header className="sticky top-0 z-30 border-b border-ink-600 bg-ink-950">
      <div className="mx-auto flex h-12 max-w-page items-center gap-3 px-4 lg:px-8">
        {back ? (
          <button onClick={() => nav(back)} aria-label="Kembali" className="tap -ml-2 grid place-items-center text-cream-300 hover:text-cream-100"><ArrowLeft size={18} /></button>
        ) : (
          <Link to="/cases" aria-label="Daftar kasus" className="-ml-1"><Logo /></Link>
        )}
        {title && <h1 className="label min-w-0 flex-1 truncate !text-cream-100">{title}</h1>}
        {!title && <span className="flex-1" />}
        {right}
        {player && (
          <Link to="/achievements" className="hidden items-center gap-3 border-l border-ink-600 pl-3 text-right sm:flex" aria-label="Pencapaian">
            <span className="leading-tight">
              <span className="block text-xs font-semibold">{player.name}</span>
              <Ar size="xs" className="ar-keep block leading-none text-gold-400">{rank.ar}</Ar>
            </span>
            <span className="docno !text-gold-400">{xp.toLocaleString('id-ID')} XP</span>
          </Link>
        )}
      </div>
    </header>
  )
}
