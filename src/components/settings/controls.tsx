import { useId, useRef } from 'react'
import type { KeyboardEvent, ReactNode } from 'react'
import { Ar } from '../common/RichText'

/** One setting: label + short description + control. Stacks on narrow screens. */
export function SettingRow({ label, desc, children, stack = false, htmlFor, id }: { label: string; desc?: string; children: ReactNode; stack?: boolean; htmlFor?: string; id?: string }) {
  return (
    <div className={`grid gap-3 border-b border-ink-600 py-4 ${stack ? '' : 'md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:gap-8'}`}>
      <div className="min-w-0">
        {htmlFor ? <label htmlFor={htmlFor} className="block text-sm font-semibold">{label}</label> : <p id={id} className="text-sm font-semibold">{label}</p>}
        {desc && <p className="mt-0.5 max-w-prose text-xs text-cream-300">{desc}</p>}
      </div>
      <div className={stack ? '' : 'md:justify-self-end'}>{children}</div>
    </div>
  )
}

export interface Option<T extends string> { value: T; label: string }

/** 2-4 mutually exclusive choices. Radio-group semantics: one tab stop, arrow keys move + select. */
export function Segmented<T extends string>({ value, options, onChange, label }: { value: T; options: readonly Option<T>[]; onChange: (v: T) => void; label: string }) {
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const idx = Math.max(0, options.findIndex((o) => o.value === value))
  function onKey(e: KeyboardEvent, i: number) {
    const map: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }
    let next = -1
    if (e.key in map) next = (i + map[e.key] + options.length) % options.length
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = options.length - 1
    if (next < 0) return
    e.preventDefault()
    onChange(options[next].value)
    refs.current[next]?.focus()
  }
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1.5">
      {options.map((o, i) => {
        const on = o.value === value
        return (
          <button key={o.value} ref={(el) => { refs.current[i] = el }} type="button" role="radio" aria-checked={on} tabIndex={i === idx ? 0 : -1}
            onClick={() => onChange(o.value)} onKeyDown={(e) => onKey(e, i)}
            className={`tap rounded-lg border px-3 text-small font-medium transition-colors ${on ? 'border-gold-500 bg-gold-500 text-on-accent' : 'border-ink-500 text-cream-200 hover:bg-ink-700'}`}>
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

export function SwitchControl({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  // the button is the (44px) touch target; the track inside is the visible control
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)} className="tap grid shrink-0 place-items-center">
      <span aria-hidden className={`relative block h-7 w-14 rounded-full border transition-colors ${on ? 'border-gold-500 bg-gold-500' : 'border-ink-500 bg-ink-900'}`}>
        <span className={`absolute top-0.5 block h-5 w-5 rounded-full transition-all ${on ? 'left-[1.875rem] bg-on-accent' : 'left-0.5 bg-cream-300'}`} />
      </span>
    </button>
  )
}

/** Select + a specimen set in the highlighted font, so the choice is visible before committing. */
export function FontSelect<T extends string>({ value, options, onChange, label, arabic = false }: { value: T; options: readonly Option<T>[]; onChange: (v: T) => void; label: string; arabic?: boolean }) {
  const id = useId()
  return (
    <div className="w-full md:w-72">
      <select id={id} aria-label={label} value={value} onChange={(e) => onChange(e.target.value as T)} className="field">
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <div className="mt-2 border border-ink-600 px-3 py-1.5" data-testid={`specimen-${arabic ? 'ar' : 'ui'}`}>
        {arabic
          ? <span data-ar-font={value} className="block"><Ar size="md" className="ar-keep block">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</Ar></span>
          : <span data-ui-font={value} className="font-sample-ui text-sm">Contoh antarmuka penyelidikan 0123</span>}
      </div>
    </div>
  )
}

export interface Swatch<T extends string> { value: T; label: string }
/** Accent presets: each swatch scopes its own data-accent so it shows the real colour. */
export function AccentPicker<T extends string>({ value, options, onChange, label }: { value: T; options: readonly Swatch<T>[]; onChange: (v: T) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = o.value === value
        return (
          <button key={o.value} type="button" role="radio" aria-checked={on} onClick={() => onChange(o.value)} data-accent={o.value}
            className={`tap flex items-center gap-2 rounded-lg border px-3 text-small ${on ? 'border-cream-100 bg-ink-700' : 'border-ink-500 hover:bg-ink-700'}`}>
            <span className="h-4 w-4 rounded-sm bg-gold-500 ring-1 ring-cream-100/50" aria-hidden />
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
