import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/common/Button'
import { Ar, RichText } from '../components/common/RichText'
import { TopBar } from '../components/common/TopBar'
import { EvidenceCard } from '../components/evidence/EvidenceCard'
import { HarborScene } from '../components/game/HarborScene'
import { pad2 } from '../utils/arabic'
import { usePlayerStore } from '../stores/playerStore'
import type { Clue, EntityKind } from '../types'

const clue: Clue = { id: 'tut', ar: 'هَذِهِ حَاوِيَةٌ.', note: 'Ini kontainer.', entity: 'container', vocab: ['container'], isEvidence: true }
const STEPS = [
  { t: 'Baca petunjuk, cari bendanya', d: 'Baca perintah Arab, lalu ketuk benda yang dimaksud.' },
  { t: 'Simpan sebagai bukti', d: 'Bukti yang kamu temukan terkumpul di Catatan Kasus.' },
  { t: 'Butuh bantuan? Tanya Dalil', d: 'Dalil memberi petunjuk bertingkat, tidak langsung jawaban.' },
  { t: 'Selesaikan kasus', d: 'Susun kesimpulan dari bukti, lalu lanjut ke kasus berikutnya.' },
]

export function Tutorial() {
  const nav = useNavigate()
  const done = usePlayerStore((s) => s.markTutorialDone)
  const [step, setStep] = useState(0)
  const [wrong, setWrong] = useState('')
  const [hint, setHint] = useState(false)

  const finish = () => { done(); nav('/case/harbor-1') }
  const next = () => { setStep((s) => s + 1); setWrong('') }

  const cur = Math.min(step, 3)
  return (
    <>
      <TopBar title="Tutorial singkat" right={<Button size="sm" onClick={finish}>Lewati</Button>} />
      <main className="mx-auto grid max-w-page gap-6 px-4 py-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-12 lg:px-8 lg:py-10">
        <ol className="flex gap-1 lg:flex-col lg:gap-0" aria-label="Langkah tutorial">
          {STEPS.map((st, i) => (
            <li key={i} aria-current={i === cur ? 'step' : undefined} className={`flex flex-1 items-baseline gap-3 border-t-2 pt-2 lg:flex-none lg:border-b lg:border-t-0 lg:border-ink-600 lg:py-3 ${i <= cur ? 'border-gold-500 text-cream-100' : 'border-ink-600 text-ink-400'}`}>
              <span className={`font-mono text-xs ${i === cur ? 'text-gold-400' : ''}`}>{pad2(i + 1)}</span>
              <span className="hidden text-sm lg:block">{st.t}</span>
            </li>
          ))}
        </ol>
        <section>
          <p className="docno">LANGKAH {pad2(cur + 1)} / {pad2(STEPS.length)}</p>
          <h2 className="text-xl font-bold">{STEPS[cur].t}</h2>
          <p className="mb-4 text-sm text-cream-300">{STEPS[cur].d}</p>

          {step === 0 && (
            <div>
              <div className="paper mb-3 flex items-center justify-between px-4 py-2"><span className="label">Perintah</span><Ar size="lg" className="text-ink-900">اِبْحَثْ عَنِ الْحَاوِيَةِ</Ar></div>
              <HarborScene entities={['container', 'ship', 'buoy', 'crane'] as EntityKind[]}
                onSelect={(k) => (k === 'container' ? next() : setWrong('Belum tepat — itu benda lain. Coba benda yang lain.'))} />
              <p className="mt-2 min-h-[1.25rem] text-sm text-bad" role="alert">{wrong}</p>
            </div>
          )}
          {step === 1 && (
            <div className="grid max-w-xl items-center gap-4 sm:grid-cols-[1fr_auto]">
              <EvidenceCard clue={clue} index={1} />
              <Button variant="primary" size="lg" onClick={next}>Simpan sebagai bukti</Button>
            </div>
          )}
          {step === 2 && (
            <div className="grid max-w-xl gap-3">
              <div className="paper on-paper p-4">
                <p className="label">Field notes · Dalil</p>
                <p className="mt-1 min-h-[3rem] text-sm leading-relaxed">{hint ? <RichText text="Petunjuk 1/3: Baca perintah dengan teliti. Setelah kata **عَنِ** ada kata benda yang dicari." /> : 'Belum ada catatan. Tekan tombol di bawah untuk mencoba.'}</p>
              </div>
              <Button onClick={() => setHint(true)}>Beri petunjuk</Button>
              <Button variant="primary" disabled={!hint} onClick={next}>Lanjut</Button>
            </div>
          )}
          {step >= 3 && (
            <div className="grid max-w-xl gap-4">
              <div className="paper on-paper p-4"><p className="label mb-1">Kesimpulanmu</p><p className="text-sm">Benda yang kamu temukan adalah <Ar size="md" className="font-semibold">الْحَاوِيَةُ</Ar> (kontainer).</p></div>
              <Button variant="primary" size="lg" onClick={finish}>Mulai Case 01</Button>
            </div>
          )}
        </section>
      </main>
    </>
  )
}
