import { caseCode } from '../../themes/registry'
import { motion } from 'framer-motion'
import { useState } from 'react'
import type { CaseDefinition } from '../../types'
import { pad2 } from '../../utils/arabic'
import { Button } from '../common/Button'
import { Ar } from '../common/RichText'
import { EntityGlyph } from './EntityIcon'

/** Stamp → (final case only) story reveal → results. The stamp is the one celebratory motion on this screen. */
export function SolvedScreen({ def, onContinue }: { def: CaseDefinition; onContinue: () => void }) {
  const [step, setStep] = useState(0)
  const reveal = def.reveal
  return (
    <div data-district={def.theme} className="district-wash mx-auto grid min-h-[80vh] max-w-page place-items-center px-4 py-10">
      {step === 0 ? (
        <div className="text-center">
          <p className="docno"><span className="text-district">{caseCode(def)}</span> · {def.titleId}</p>
          <div className="stamp-in mx-auto mt-4 inline-block border-[3px] border-good px-8 py-4 text-good">
            <p className="font-mono text-3xl font-medium uppercase tracking-[.2em] sm:text-5xl">Case solved</p>
            <Ar size="xl" className="block">تَمَّ حَلُّ الْقَضِيَّةِ</Ar>
          </div>
          <p className="paper mx-auto mt-8 max-w-lg px-5 py-4 text-left text-sm leading-relaxed">{def.solution.summary}</p>
          <Button variant="primary" size="lg" className="mt-6" onClick={() => (reveal ? setStep(1) : onContinue())}>{reveal ? 'Lihat pengungkapan' : 'Lihat laporan kasus'}</Button>
        </div>
      ) : (
        <div className="w-full max-w-2xl">
          <p className="docno"><span className="text-district">{caseCode(def)}</span> · PENGUNGKAPAN</p>
          <h2 className="mb-4 border-b border-cream-100/60 pb-2 text-2xl font-bold tracking-tight">Pengungkapan akhir</h2>
          <ol className="space-y-2">
            {reveal!.lines.map((l, i) => (
              <motion.li key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.45 * i }} className="paper flex items-center gap-4 p-3">
                <span className="docno">{pad2(i + 1)}</span>
                <EntityGlyph kind={['container', 'officer', 'warehouse', 'cargo'][i] as 'container'} size={40} />
                <div><Ar size="md" className="block">{l.ar}</Ar><span className="text-xs text-ink-600">{l.id}</span></div>
              </motion.li>
            ))}
          </ol>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 * reveal!.lines.length + 0.2 }} className="mt-4 border-l-2 border-gold-500 pl-4 text-sm leading-relaxed">{reveal!.conclusion}</motion.p>
          <div className="mt-6"><Button variant="primary" size="lg" onClick={onContinue}>Lihat laporan akhir</Button></div>
        </div>
      )}
    </div>
  )
}
