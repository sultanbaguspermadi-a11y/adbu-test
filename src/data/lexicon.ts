import { stripArabic } from '../utils/arabic'
import { MARKET_ADJECTIVES, PREPS, VOCAB } from './vocabulary'
import { NUMERAL_VALUES, numeralForCountedNoun, numeralForms } from '../utils/numerals'

export type LexKind = 'noun' | 'prep' | 'verb' | 'pron' | 'particle' | 'numeral' | 'adj'
export interface LexEntry { key: string; ar: string; idn: string; kind: LexKind; refId?: string }
export interface GlossItem { surface: string; entry: LexEntry | null; conj?: boolean; /** Attached preposition بِ ("dengan / seharga") split off the word. */ bi?: boolean }

const index = new Map<string, LexEntry>()

function add(ar: string, idn: string, kind: LexKind, refId?: string, extraForms: string[] = []) {
  const key = stripArabic(ar)
  const entry: LexEntry = { key, ar, idn, kind, refId }
  const forms = new Set<string>([key, ...extraForms.map(stripArabic)])
  if ((kind === 'noun' || kind === 'adj') && !key.startsWith('ال')) forms.add('ال' + key)
  forms.forEach((f) => { if (!index.has(f)) index.set(f, entry) })
}

VOCAB.forEach((v) => {
  add(v.ar, v.idn, 'noun', v.id)
  if (v.grammar?.dual) add(v.grammar.dual, `${v.idn} (dua / bentuk dual)`, 'noun', v.id)
  if (v.grammar) add(v.grammar.pluralGenitive, `${v.idn} (jamak)`, 'noun', v.id)
})
NUMERAL_VALUES.forEach((value) => {
  const f = numeralForms(value)
  const idn = ['satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan', 'sepuluh'][value - 1]
  const id = `num-${value}`
  if (f.rule === 'agreement') {
    add(f.unmarked, `${idn} (mengikuti benda maskulin)`, 'numeral', id)
    add(f.marked, `${idn} (mengikuti benda feminin)`, 'numeral', id)
  } else {
    add(f.marked, `${idn} (untuk benda maskulin)`, 'numeral', id)
    add(f.unmarked, `${idn} (untuk benda feminin)`, 'numeral', id)
  }
})
NUMERAL_VALUES.forEach((value) => {
  // genitive forms (after a preposition such as بِ) share the meaning of the nominative ones
  const idn = ['satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan', 'sepuluh'][value - 1]
  for (const g of ['m', 'f'] as const) add(numeralForCountedNoun(value, g, 'genitive'), `${idn} (setelah kata depan)`, 'numeral', `num-${value}`)
})
MARKET_ADJECTIVES.forEach((a) => {
  add(a.adj!.m, `${a.idn} (untuk benda maskulin)`, 'adj', a.id)
  add(a.adj!.f, `${a.idn} (untuk benda feminin)`, 'adj', a.id)
})
PREPS.forEach((p) => add(p.ar, p.idn, 'prep', p.id))

add('رَأَيْتُ', 'aku melihat', 'verb')
add('رَأَيْنَا', 'kami melihat', 'verb')
add('أَنَا', 'aku / saya', 'pron')
add('نَحْنُ', 'kami', 'pron')
add('لَيْسَ', 'bukan / tidak ada (untuk laki-laki / benda maskulin)', 'particle')
add('لَيْسَتْ', 'bukan / tidak ada (untuk benda feminin)', 'particle')
add('هَذَا', 'ini (maskulin)', 'pron')
add('هَذِهِ', 'ini (feminin)', 'pron')
add('اِبْحَثْ', 'carilah', 'verb')
add('عَنْ', 'tentang / untuk', 'particle')
add('الْمِينَاءُ', 'pelabuhan', 'noun')
add('أَيْنَ', 'di mana', 'particle')
add('مَنْ', 'siapa', 'particle')
add('وَ', 'dan', 'particle')
add('الْمَسْؤُولُ', 'yang bertanggung jawab', 'noun')
add('عَلَى', 'di atas', 'prep')
add('كَمْ', 'berapa', 'particle')
add('بِكَمْ', 'berapa harganya (secara harfiah: dengan berapa)', 'particle')
add('هُوَ', 'dia / ia (maskulin)', 'pron')
add('هِيَ', 'dia / ia (feminin)', 'pron')
add('سِعْرُهُ', 'harganya (benda maskulin)', 'noun', 'tag')
add('سِعْرُهَا', 'harganya (benda feminin)', 'noun', 'tag')
add('الطَّلَبُ', 'pesanan', 'noun')
add('الْعَدَدُ', 'jumlah / bilangan', 'noun')
add('اللَّوْنُ', 'warna', 'noun')
add('الطَّرْدُ', 'paket', 'noun', 'package')

/** Greedy word-by-word gloss. Two-word idafa phrases (قَارِبُ النَّجَاةِ, صَالَةُ الِانْتِظَارِ) are matched first. */
export function glossSentence(ar: string): GlossItem[] {
  const tokens = ar.split(/\s+/).filter(Boolean)
  const out: GlossItem[] = []
  for (let i = 0; i < tokens.length; ) {
    if (i + 1 < tokens.length) {
      const phrase = stripArabic(`${tokens[i]} ${tokens[i + 1]}`)
      const hit = index.get(phrase)
      if (hit) { out.push({ surface: `${tokens[i]} ${tokens[i + 1]}`, entry: hit }); i += 2; continue }
    }
    const key = stripArabic(tokens[i])
    let entry = index.get(key) ?? null
    let conj = false
    let bi = false
    if (!entry && key.length > 2 && key.startsWith('و')) {
      const rest = index.get(key.slice(1))
      if (rest) { entry = rest; conj = true }
    }
    if (!entry && key.length > 2 && key.startsWith('ب')) {
      const rest = index.get(key.slice(1))
      if (rest) { entry = rest; bi = true }
    }
    out.push({ surface: tokens[i], entry, conj, ...(bi ? { bi } : {}) })
    i++
  }
  return out
}

export function lookupWord(surface: string): LexEntry | null {
  return glossSentence(surface)[0]?.entry ?? null
}

/** Short structural note about a sentence, derived from the prepositions it contains. */
export function describePattern(ar: string): string {
  const g = glossSentence(ar)
  const preps = g.filter((x) => x.entry?.kind === 'prep').map((x) => x.entry!.ar)
  const neg = g.some((x) => x.entry?.kind === 'particle' && /^لي/.test(x.entry.key))
  if (preps.length === 0) return 'Kalimat ini tidak memuat kata depan tempat.'
  const base = `Pola: **[benda / orang]** + **${preps.join(' / ')}** + **[tempat]**.`
  return neg ? `${base} Ada kata penyangkal (**لَيْسَ / لَيْسَتْ**) — artinya kalimat menyangkal posisi itu.` : base
}
