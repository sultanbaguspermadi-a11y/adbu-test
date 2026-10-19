import defaultTheme from 'tailwindcss/defaultTheme'

/** @type {import('tailwindcss').Config} */
// Design tokens for the "Maritime Investigation Archive" look.
// Every colour, radius, font, text size, spacing step and the content width is a CSS variable (see src/styles/palette.css and
// src/styles/theme.css), so themes, accents, density and the other appearance preferences change the whole app without
// touching component classes. Defaults reproduce the original design exactly.
//   ink = desk surfaces, cream = text on the desk + paper stock, gold = the accent (user-selectable),
//   coral = rust (evidence / danger), steel = muted blue-grey, good/bad = verified / error.

const rgb = (name) => `rgb(var(--c-${name}) / <alpha-value>)`
const scale = (steps, prefix) => Object.fromEntries(steps.map((n) => [n, rgb(`${prefix}-${n}`)]))

// text sizes: multiplied by --ui-font-scale; line-height is a unitless ratio multiplied by --ui-leading-eff (display sizes keep theirs)
const ratio = (size, lh) => (String(lh).endsWith('rem') ? parseFloat(lh) / parseFloat(size) : parseFloat(lh))
const fontSize = {}
for (const [key, [size, opts]] of Object.entries(defaultTheme.fontSize)) {
  const lh = typeof opts === 'string' ? opts : opts.lineHeight
  const r = ratio(size, lh)
  fontSize[key] = [`calc(${size} * var(--ui-font-scale))`, { ...(typeof opts === 'object' ? opts : {}), lineHeight: r < 1.2 ? String(r) : `calc(${r.toFixed(4)} * var(--ui-leading-eff))` }]
}
const named = { nano: 9, micro: 10, tiny: 11, small: 13, body: 15 } // replaces text-[9px] … text-[15px]
for (const [key, px] of Object.entries(named)) fontSize[key] = [`calc(${px / 16}rem * var(--ui-font-scale))`, { lineHeight: `calc(1.35 * var(--ui-leading-eff))` }]

// padding / margin / gap / space follow the density token; widths, heights and positions do not
const dense = (sp) => Object.fromEntries(Object.entries(sp).map(([k, v]) => [k, k === '0' || k === 'px' || v === '0px' || v === '1px' ? v : `calc(${v} * var(--density))`]))

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  safelist: [{ pattern: /^ar-(xs|sm|cue|md|lg|xl|hero|inline|keep)$/ }], // Ar builds these names dynamically
  theme: {
    borderRadius: { none: '0', sm: 'var(--radius-xs)', DEFAULT: 'var(--radius-xs)', md: 'var(--radius-sm)', lg: 'var(--radius-md)', xl: 'var(--radius-lg)', '2xl': 'var(--radius-xl)', '3xl': 'var(--radius-xl)', full: '9999px' },
    fontSize,
    padding: ({ theme }) => dense(theme('spacing')),
    margin: ({ theme }) => ({ auto: 'auto', ...dense(theme('spacing')) }),
    gap: ({ theme }) => dense(theme('spacing')),
    space: ({ theme }) => dense(theme('spacing')),
    extend: {
      // phones held sideways: little height, so layouts give the scene the full height and move text to a side column
      screens: { short: { raw: '(orientation: landscape) and (max-height: 520px)' } },
      colors: {
        ink: scale([950, 900, 800, 700, 600, 500, 400, 300], 'ink'),
        cream: scale([50, 100, 200, 300, 400], 'cream'),
        gold: scale([300, 400, 500, 600, 700], 'gold'),
        steel: scale([300, 400, 500], 'steel'),
        coral: rgb('coral'),
        good: rgb('good'),
        bad: rgb('bad'),
        'on-accent': rgb('on-accent'),
        paper: rgb('paper'),
        district: rgb('district'),
      },
      // alpha modifiers that must go opaque under "reduce transparency":  bg-ink-950/scrim, bg-ink-800/soft …
      opacity: { scrim: 'var(--alpha-scrim)', 'scrim-sm': 'var(--alpha-scrim-sm)', glass: 'var(--alpha-glass)', soft: 'var(--alpha-soft)', 'soft-sm': 'var(--alpha-soft-sm)' },
      fontFamily: {
        sans: ['var(--font-ui)'],
        arabic: ['var(--font-arabic)'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      maxWidth: { page: 'var(--content-max)' },
    },
  },
  plugins: [],
}
