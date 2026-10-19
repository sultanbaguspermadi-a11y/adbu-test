import type { CaseDefinition } from '../../types'
import { getLexeme } from '../../data/vocabulary'
import { pad2 } from '../../utils/arabic'
import { Button } from '../common/Button'
import { Ar } from '../common/RichText'
import { THEMES, caseCode } from '../../themes/registry'
import { themeView } from '../../themes/views'
import { SCENE_LABEL } from './MarketScene'

/** Case cover sheet: what happened (paper), what you must learn and which words matter (desk). */
export function Briefing({ def, onStart, onBack }: { def: CaseDefinition; onStart: () => void; onBack: () => void }) {
  const vocab = def.vocabulary.map((v) => getLexeme(v)).filter((x): x is NonNullable<typeof x> => Boolean(x))
  const theme = THEMES[def.theme]
  const Scene = themeView(def.theme).Scene
  return (
    <div data-district={def.theme} className="district-wash mx-auto grid max-w-page gap-6 px-4 py-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-10 lg:px-8 lg:py-10">
      <article className="paper reg p-6 sm:p-8 lg:p-10" style={{ borderBottom: '4px solid rgb(var(--c-district))' }} aria-label="Berkas kasus">
        <div className="flex items-start justify-between gap-4">
          <p className="docno">BERKAS KASUS NO. {caseCode(def)} · {theme.docLabel}</p>
          <span className="stamp stamp-rust -rotate-3">Berkas kasus</span>
        </div>
        <Ar size="xl" className="mt-4 block text-left leading-tight">{def.titleAr}</Ar>
        <h2 className="text-2xl font-bold tracking-tight">{def.titleId}</h2>
        <p className="rule mt-5 max-w-prose pt-4 text-body leading-relaxed text-ink-800">{def.story}</p>
        <figure className="m-0 mt-6 max-w-prose" role="img" aria-label={`Lokasi kasus: ${def.scene ? SCENE_LABEL[def.scene as keyof typeof SCENE_LABEL] ?? theme.titleId : theme.titleId}`}>
          <div className="pointer-events-none"><Scene variant={def.scene} onSelect={() => {}} disabled hideBonus /></div>
        </figure>
        <dl className="rule mt-6 grid max-w-prose grid-cols-2 gap-4 pt-4 text-sm">
          <div><dt className="label">Level</dt><dd className="font-semibold">{def.learningLevel}</dd></div>
          <div><dt className="label">Mekanik</dt><dd className="font-semibold">{def.mechanic}</dd></div>
        </dl>
      </article>

      <section className="flex flex-col gap-6" aria-label="Tujuan dan kosakata">
        <div>
          <h3 className="label border-b border-ink-600 pb-1.5 !text-cream-100">Tujuan belajar</h3>
          <ol className="mt-2 space-y-2">
            {def.objectives.map((o, i) => (
              <li key={o} className="flex gap-3 text-sm leading-snug"><span className="docno pt-0.5">{pad2(i + 1)}</span><span>{o}</span></li>
            ))}
          </ol>
        </div>
        <div>
          <h3 className="label border-b border-ink-600 pb-1.5 !text-cream-100">Kata kunci kasus</h3>
          <ul className="mt-2 grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
            {vocab.map((v) => (
              <li key={v.id} className="border border-ink-600 bg-ink-800 px-2.5 py-1">
                <Ar size="sm" className="block !leading-snug">{v.ar}</Ar>
                {def.showVocabMeaning && <span className="text-xs text-cream-300">{v.idn}</span>}
              </li>
            ))}
          </ul>
          {!def.showVocabMeaning && <p className="mt-2 text-xs text-cream-300">Artinya terungkap saat kamu menemukan bukti.</p>}
        </div>
        <div className="mt-auto flex flex-col-reverse gap-3 sm:flex-row sm:justify-between lg:flex-col-reverse xl:flex-row">
          <Button onClick={onBack}>Kembali ke berkas</Button>
          <Button variant="primary" size="lg" onClick={onStart}>Mulai penyelidikan</Button>
        </div>
      </section>
    </div>
  )
}
