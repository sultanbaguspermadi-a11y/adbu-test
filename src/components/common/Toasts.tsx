import { AnimatePresence, motion } from 'framer-motion'
import { useUiStore } from '../../stores/uiStore'
import { Ar } from './RichText'

const KIND = { achievement: ['PENCAPAIAN', 'border-gold-500'], success: ['TERVERIFIKASI', 'border-good'], info: ['CATATAN', 'border-steel-400'] } as const

/** Flat notice slips: a colour edge + a mono label say what kind of event this is. */
export function Toasts() {
  const toasts = useUiStore((s) => s.toasts)
  const dismiss = useUiStore((s) => s.dismiss)
  return (
    <div className="pointer-events-none fixed inset-x-0 top-14 z-[70] flex flex-col items-center gap-2 px-3 sm:items-end sm:px-6" aria-live="polite">
      <AnimatePresence>
        {toasts.map((t) => {
          const [label, edge] = KIND[t.kind] ?? KIND.info
          return (
            <motion.button key={t.id} layout onClick={() => dismiss(t.id)}
              initial={{ x: 16, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.16 }}
              className={`pointer-events-auto w-full max-w-sm rounded-lg border border-ink-500 border-l-4 bg-ink-800 px-4 py-2.5 text-left ${edge}`}>
              <span className="label block">{label}</span>
              <span className="block text-sm font-semibold">{t.title}</span>
              {t.ar && <Ar size="sm" className="block text-gold-300">{t.ar}</Ar>}
              {t.body && <span className="block text-xs text-cream-300">{t.body}</span>}
            </motion.button>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
