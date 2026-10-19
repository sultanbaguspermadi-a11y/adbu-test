import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'

interface Props { open: boolean; onClose: () => void; title: string; children: ReactNode; footer?: ReactNode; side?: 'right' }

/** Right drawer on ≥ md, bottom sheet on mobile. Escape / backdrop closes; focus moves into the dialog. */
export function Sheet({ open, onClose, title, children, footer }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const prev = document.activeElement as HTMLElement | null
    ref.current?.focus()
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => { window.removeEventListener('keydown', onKey); prev?.focus?.() }
  }, [open, onClose])
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-end md:items-stretch">
          <motion.div className="absolute inset-0 bg-ink-950/scrim-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} aria-hidden />
          <motion.div
            ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-label={title}
            className="relative flex outline-none max-h-[88dvh] w-full flex-col rounded-t-xl border border-ink-600 bg-ink-800 md:max-h-none md:w-[440px] md:rounded-none md:border-y-0 md:border-r-0"
            initial={{ y: 40, x: 0, opacity: 0 }} animate={{ y: 0, x: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} transition={{ duration: 0.18 }}
          >
            <header className="flex items-center justify-between border-b border-ink-600 px-4 py-2">
              <h2 className="label !text-cream-100">{title}</h2>
              <button onClick={onClose} aria-label="Tutup" className="tap grid place-items-center text-cream-300 hover:text-cream-100"><X size={18} /></button>
            </header>
            <div className="flex-1 overflow-y-auto px-4 py-4">{children}</div>
            {footer && <footer className="border-t border-ink-600 px-4 py-3">{footer}</footer>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
