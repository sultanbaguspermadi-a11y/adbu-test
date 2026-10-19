import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../components/common/Button'
import { Logo } from '../components/common/TopBar'
import { Ar } from '../components/common/RichText'
import { THEME_VIEWS } from '../themes/views'
import { THEMES, THEME_ORDER } from '../themes/registry'
import { CASES, casesOfTheme } from '../data/cases'
import { useActivePlayer } from '../stores/playerStore'

/** Cover sheet of the whole game: what it is, how many districts and cases, one action. The two plates preview the districts; they are not controls. */
export function Landing() {
  const nav = useNavigate()
  const player = useActivePlayer()
  const facts: [string, string][] = [['Kasus', String(CASES.length).padStart(2, '0')], ['Distrik', String(THEME_ORDER.length).padStart(2, '0')], ['Sasaran', 'Siswa SMK'], ['Petunjuk', 'Offline']]
  return (
    <main className="min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-page flex-col px-4 lg:px-8">
        <header className="flex items-center justify-between py-4">
          <Logo />
          <Link to="/teacher" className="tap inline-flex items-center font-mono text-xs uppercase tracking-[.14em] text-cream-300 hover:text-cream-100">Mode Guru</Link>
        </header>

        <div className="grid flex-1 items-center gap-8 pb-10 pt-2 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-12 lg:pb-14">
          <section>
            <p className="docno">ARSIP KASUS · {THEME_ORDER.map((id) => THEMES[id].docLabel).join(' · ')}</p>
            <h1 className="mt-3 text-5xl font-extrabold leading-[1.02] tracking-tight sm:text-6xl xl:text-7xl">Arabic<br />Detective</h1>
            <Ar size="xl" className="mt-2 block text-left text-gold-400">المُحَقِّقُ اللُّغَوِيُّ</Ar>

            <div className="rule mt-6 max-w-xl pt-4">
              <Ar size="lg" className="block text-left">تَحْقِيقَاتٌ فِي الْمِينَاءِ وَالسُّوقِ</Ar>
              <p className="mt-1 max-w-md text-base text-cream-200">Baca petunjuk berbahasa Arab, kumpulkan bukti, dan pecahkan kasus di dua distrik: pelabuhan dan pasar.</p>
            </div>

            <dl className="mt-6 grid max-w-xl grid-cols-2 gap-y-3 border-y border-ink-600 py-3 sm:grid-cols-4">
              {facts.map(([k, v]) => <div key={k} className="pr-3"><dt className="label">{k}</dt><dd className="mt-0.5 font-semibold">{v}</dd></div>)}
            </dl>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Button variant="primary" size="lg" onClick={() => nav(player ? '/cases' : '/setup')}>{player ? 'Lanjutkan investigasi' : 'Mulai investigasi'}</Button>
              {player && <Button size="lg" onClick={() => nav('/setup')}>Ganti siswa</Button>}
            </div>
            {player && <p className="mt-3 text-sm text-cream-300">Masuk sebagai <span className="font-semibold text-cream-100">{player.name}</span></p>}
          </section>

          <section className="grid grid-cols-2 gap-3 sm:gap-4" aria-label="Dua distrik investigasi">
            {THEME_ORDER.map((id) => {
              const theme = THEMES[id]
              const View = THEME_VIEWS[id]
              return (
                <figure key={id} data-district={theme.district} className="m-0 border border-ink-600 bg-ink-950">
                  <View.Plate className="block h-auto w-full" />
                  <figcaption className="flex items-center justify-between gap-2 border-t-2 border-district px-3 py-2">
                    <span><span className="block font-mono text-tiny uppercase tracking-[.14em] text-district">{theme.docLabel}</span><Ar size="sm" className="block text-left !leading-snug">{theme.titleAr}</Ar></span>
                    <span className="docno">{String(casesOfTheme(id).length).padStart(2, '0')} KASUS</span>
                  </figcaption>
                </figure>
              )
            })}
          </section>
        </div>
      </div>
    </main>
  )
}
