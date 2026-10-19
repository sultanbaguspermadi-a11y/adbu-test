import { AnimatePresence, motion } from 'framer-motion'
import { Ar, RichText } from '../common/RichText'

export interface Feedback { kind: 'good' | 'bad' | 'info'; text: string; key?: number }
const GOOD = ['أَحْسَنْتَ!', 'مُمْتَازٌ!', 'رَائِعٌ!']
let n = 0
const LOOK = {
  good: { label: 'Terverifikasi', edge: 'border-l-good', text: 'text-good', tag: '!text-good' },
  bad: { label: 'Belum tepat', edge: 'border-l-bad', text: 'text-bad', tag: '!text-bad' },
  info: { label: 'Catatan', edge: 'border-l-steel-400', text: 'text-steel-300', tag: '!text-steel-300' },
} as const

/** Result of an action. Colour edge + mono label + Arabic phrase; a wrong answer shakes once, a correct one just appears. */
export function FeedbackBanner({ feedback }: { feedback: Feedback | null }) {
  return (
    <div aria-live="polite" className="min-h-[3.5rem]">
      <AnimatePresence mode="wait">
        {feedback && (
          <motion.div key={feedback.key ?? feedback.text} initial={{ opacity: 0 }} animate={{ opacity: 1, x: feedback.kind === 'bad' ? [0, -5, 5, -3, 0] : 0 }} exit={{ opacity: 0 }} transition={{ duration: feedback.kind === 'bad' ? 0.3 : 0.12 }}
            className={`rounded-lg border border-ink-600 border-l-4 bg-ink-800 px-3 py-2 ${LOOK[feedback.kind].edge}`}>
            <p className={`label ${LOOK[feedback.kind].tag}`}>{LOOK[feedback.kind].label}</p>
            <div className="text-sm leading-relaxed">
              {feedback.kind === 'good' && <Ar size="cue" className={`block leading-normal ${LOOK.good.text}`}>{GOOD[n++ % GOOD.length]}</Ar>}
              {feedback.kind === 'bad' && <Ar size="sm" className={`block leading-normal ${LOOK.bad.text}`}>حَاوِلْ مَرَّةً أُخْرَى</Ar>}
              <RichText text={feedback.text} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
