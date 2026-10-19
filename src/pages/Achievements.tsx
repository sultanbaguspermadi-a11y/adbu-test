import { Award, BookOpenCheck, Eye, MapPin, Trophy } from 'lucide-react'
import { TopBar } from '../components/common/TopBar'
import { Ar } from '../components/common/RichText'
import { ACHIEVEMENTS } from '../data/achievements'
import { totalXp } from '../engine/analytics'
import { RANKS, getRank } from '../engine/scoring'
import { useActivePlayer } from '../stores/playerStore'
import { pad2 } from '../utils/arabic'

const ICONS = { eye: Eye, book: BookOpenCheck, map: MapPin, trophy: Trophy }

export function Achievements() {
  const player = useActivePlayer()!
  const xp = totalXp(player)
  const { rank } = getRank(xp)
  return (
    <>
      <TopBar title="Pencapaian" back="/cases" />
      <main className="mx-auto grid max-w-page gap-8 px-4 py-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-12 lg:px-8 lg:py-10">
        <section aria-label="Peringkat">
          <div className="flex items-end justify-between border-b border-cream-100/60 pb-2"><h2 className="text-xl font-bold">Peringkat</h2><span className="docno">{xp.toLocaleString('id-ID')} XP</span></div>
          <ol>
            {RANKS.map((r) => {
              const reached = xp >= r.min
              return (
                <li key={r.id} className={`grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-ink-600 py-3 ${reached ? '' : 'opacity-55'}`} aria-current={r.id === rank.id ? 'true' : undefined}>
                  <span><Ar size="lg" className={`block leading-snug ${r.id === rank.id ? 'text-gold-400' : ''}`}>{r.ar}</Ar><span className="text-sm text-cream-300">{r.idn} · mulai {r.min} XP</span></span>
                  {r.id === rank.id ? <span className="stamp stamp-amber">Saat ini</span> : reached ? <span className="stamp stamp-green">Tercapai</span> : <span className="stamp stamp-mute">Terkunci</span>}
                </li>
              )
            })}
          </ol>
        </section>
        <section aria-label="Pencapaian">
          <div className="flex items-end justify-between border-b border-cream-100/60 pb-2"><h2 className="text-xl font-bold">Lencana penyelidik</h2><span className="docno">{pad2(Object.keys(player.achievements).length)}/{pad2(ACHIEVEMENTS.length)}</span></div>
          <ul className="grid sm:grid-cols-2 sm:gap-x-8">
            {ACHIEVEMENTS.map((a) => {
              const at = player.achievements[a.id]
              const Icon = ICONS[a.icon] ?? Award
              return (
                <li key={a.id} className={`flex gap-4 border-b border-ink-600 py-4 ${at ? '' : 'opacity-60'}`}>
                  <span className={`grid h-12 w-12 shrink-0 place-items-center border ${at ? 'border-gold-500 text-gold-400' : 'border-ink-500 text-ink-400'}`}><Icon size={22} strokeWidth={1.6} /></span>
                  <div className="min-w-0">
                    <Ar size="md" className={`block leading-snug ${at ? 'text-gold-400' : 'text-cream-300'}`}>{a.ar}</Ar>
                    <p className="text-sm font-semibold">{a.idn}</p>
                    <p className="text-xs text-cream-300">{a.desc}</p>
                    <p className={`docno mt-1 ${at ? '!text-good' : ''}`}>{at ? `TERBUKA · ${new Date(at).toLocaleDateString('id-ID')}` : 'TERKUNCI'}</p>
                  </div>
                </li>
              )
            })}
          </ul>
        </section>
      </main>
    </>
  )
}
