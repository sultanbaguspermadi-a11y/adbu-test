import type { CountableEntry, MarketVocabId, HarborVocabId, LexiconId, MarketEntityKind, NumeralEntry, PrepEntry, VocabEntry, VocabId } from '../types'
import { NUMERAL_VALUES, numeralForms } from '../utils/numerals'
import type { CountedNoun } from '../utils/numerals'

export const HARBOR_VOCAB: readonly VocabEntry<HarborVocabId>[] = [
  { id: 'ship', ar: 'سَفِينَةٌ', idn: 'kapal', cue: 'Kendaraan besar di atas air, punya lambung dan anjungan.' },
  { id: 'warehouse', ar: 'مَخْزَنٌ', idn: 'gudang', cue: 'Bangunan besar beratap tempat menyimpan barang.' },
  { id: 'crane', ar: 'رَافِعَةٌ', idn: 'derek / alat pengangkat', cue: 'Alat tinggi dengan lengan dan kait untuk mengangkat beban.' },
  { id: 'officer', ar: 'ضَابِطٌ', idn: 'perwira', cue: 'Petugas berseragam dengan topi gelap dan tanda pangkat di bahu.' },
  { id: 'passengers', ar: 'رُكَّابٌ', idn: 'para penumpang', cue: 'Sekelompok orang yang membawa koper.' },
  { id: 'captain', ar: 'رُبَّانٌ', idn: 'nakhoda kapal', cue: 'Pemimpin kapal bertopi putih.' },
  { id: 'waitingHall', ar: 'صَالَةُ الِانْتِظَارِ', idn: 'ruang tunggu', cue: 'Bangunan beratap dengan jendela besar dan bangku untuk menunggu.' },
  { id: 'cargo', ar: 'بِضَاعَةٌ', idn: 'barang / muatan', cue: 'Tumpukan peti kayu.' },
  { id: 'container', ar: 'حَاوِيَةٌ', idn: 'kontainer', cue: 'Kotak baja besar dengan rusuk bergelombang.' },
  { id: 'lifeboat', ar: 'قَارِبُ النَّجَاةِ', idn: 'sekoci', cue: 'Perahu penyelamat berwarna oranye.' },
  { id: 'buoy', ar: 'عَوَّامَةٌ', idn: 'pelampung', cue: 'Cincin pelampung merah-putih.' },
]

export const PREPS: PrepEntry[] = [
  { id: 'amama', ar: 'أَمَامَ', idn: 'di depan' },
  { id: 'khalfa', ar: 'خَلْفَ', idn: 'di belakang' },
  { id: 'bijanib', ar: 'بِجَانِبِ', idn: 'di samping' },
  { id: 'bayna', ar: 'بَيْنَ', idn: 'di antara' },
  { id: 'fi', ar: 'فِي', idn: 'di / di dalam' },
  { id: 'qurba', ar: 'قُرْبَ', idn: 'dekat' },
]

const countable = (
  id: CountableEntry['id'], ar: string, idn: string, cue: string, gender: 'm' | 'f', dual: string, pluralGenitive: string,
): CountableEntry => ({ id, ar, idn, cue, grammar: { gender, dual, pluralGenitive } })

/** Countable Market nouns carry gender, dual and plural genitive (all regular, triptote plurals) so counting phrases can be generated. */
export const MARKET_COUNTABLES: readonly CountableEntry[] = [
  countable('book', 'كِتَابٌ', 'buku', 'Lembaran kertas berjilid yang dibaca.', 'm', 'كِتَابَانِ', 'كُتُبٍ'),
  countable('pen', 'قَلَمٌ', 'pena', 'Alat tulis berbentuk batang kecil.', 'm', 'قَلَمَانِ', 'أَقْلَامٍ'),
  countable('shirt', 'قَمِيصٌ', 'kemeja', 'Pakaian atasan berkerah dan berkancing.', 'm', 'قَمِيصَانِ', 'قُمْصَانٍ'),
  countable('watch', 'سَاعَةٌ', 'jam', 'Penunjuk waktu kecil yang dipakai di pergelangan tangan.', 'f', 'سَاعَتَانِ', 'سَاعَاتٍ'),
  countable('apple', 'تُفَّاحَةٌ', 'apel', 'Buah bulat berwarna merah atau hijau.', 'f', 'تُفَّاحَتَانِ', 'تُفَّاحَاتٍ'),
  countable('card', 'بِطَاقَةٌ', 'kartu', 'Lembar kecil dari kertas tebal atau plastik.', 'f', 'بِطَاقَتَانِ', 'بِطَاقَاتٍ'),
  countable('bag', 'كِيسٌ', 'kantong', 'Wadah lentur untuk membawa barang belanjaan.', 'm', 'كِيسَانِ', 'أَكْيَاسٍ'),
  countable('basket', 'سَلَّةٌ', 'keranjang', 'Wadah anyaman untuk menaruh barang.', 'f', 'سَلَّتَانِ', 'سِلَالٍ'),
  countable('package', 'طَرْدٌ', 'paket', 'Barang terbungkus yang dikirim kepada pembeli.', 'm', 'طَرْدَانِ', 'طُرُودٍ'),
  countable('riyal', 'رِيَالٌ', 'riyal', 'Mata uang yang dipakai di pasar ini.', 'm', 'رِيَالَانِ', 'رِيَالَاتٍ'),
  countable('shelf', 'رَفٌّ', 'rak', 'Papan tempat barang disusun di toko.', 'm', 'رَفَّانِ', 'رُفُوفٍ'),
]

const noun = (id: MarketEntityKind, ar: string, idn: string, cue: string): VocabEntry<MarketEntityKind> => ({ id, ar, idn, cue })

const MARKET_FIXTURES: readonly VocabEntry<MarketEntityKind>[] = [
  noun('seller', 'بَائِعٌ', 'penjual', 'Orang yang menjual barang.'),
  noun('customer', 'زَبُونٌ', 'pelanggan', 'Orang yang membeli barang.'),
  noun('shop', 'مَتْجَرٌ', 'toko', 'Tempat barang dijual.'),
  noun('scale', 'مِيزَانٌ', 'timbangan', 'Alat untuk menimbang barang.'),
  noun('ledger', 'دَفْتَرٌ', 'buku catatan', 'Buku tempat penjual mencatat barang dan uang.'),
  noun('receipt', 'فَاتُورَةٌ', 'struk', 'Kertas bukti pembelian.'),
  noun('tag', 'سِعْرٌ', 'harga', 'Angka yang menunjukkan berapa barang harus dibayar.'),
]

const adjective = (id: VocabId, m: string, f: string, idn: string): VocabEntry => ({ id, ar: `${m} / ${f}`, idn, cue: 'Kata sifat: bentuknya mengikuti jenis benda.', adj: { m, f } })

/** Adjectives (colour, size) with their masculine and feminine forms. Used for agreement tasks. */
export const MARKET_ADJECTIVES: readonly VocabEntry[] = [
  adjective('red', 'أَحْمَرُ', 'حَمْرَاءُ', 'merah'),
  adjective('blue', 'أَزْرَقُ', 'زَرْقَاءُ', 'biru'),
  adjective('green', 'أَخْضَرُ', 'خَضْرَاءُ', 'hijau'),
  adjective('yellow', 'أَصْفَرُ', 'صَفْرَاءُ', 'kuning'),
  adjective('white', 'أَبْيَضُ', 'بَيْضَاءُ', 'putih'),
  adjective('black', 'أَسْوَدُ', 'سَوْدَاءُ', 'hitam'),
  adjective('big', 'كَبِيرٌ', 'كَبِيرَةٌ', 'besar'),
  adjective('small', 'صَغِيرٌ', 'صَغِيرَةٌ', 'kecil'),
  adjective('new', 'جَدِيدٌ', 'جَدِيدَةٌ', 'baru'),
]

export const MARKET_VOCAB: readonly VocabEntry<MarketVocabId>[] = [...MARKET_COUNTABLES, ...MARKET_FIXTURES, ...MARKET_ADJECTIVES] as readonly VocabEntry<MarketVocabId>[]

/** Every theme-owned noun, for global lookups (lexicon, analytics). Ownership per theme lives in THEMES. */
export const VOCAB: readonly VocabEntry[] = [...HARBOR_VOCAB, ...MARKET_VOCAB]

const NUMERAL_NAMES: Record<number, string> = { 1: 'satu', 2: 'dua', 3: 'tiga', 4: 'empat', 5: 'lima', 6: 'enam', 7: 'tujuh', 8: 'delapan', 9: 'sembilan', 10: 'sepuluh' }

/** Shared numerals 1–10, shown as "unmarked / marked" because the right form depends on the counted noun. */
export const NUMERALS: readonly NumeralEntry[] = NUMERAL_VALUES.map((value) => {
  const f = numeralForms(value)
  return { id: `num-${value}` as const, value, ar: `${f.unmarked} / ${f.marked}`, idn: NUMERAL_NAMES[value] }
})

const vocabMap = new Map<string, VocabEntry>(VOCAB.map((v) => [v.id, v]))
const prepMap = new Map<string, PrepEntry>(PREPS.map((p) => [p.id, p]))
const numeralMap = new Map<string, NumeralEntry>(NUMERALS.map((n) => [n.id, n]))

export const getVocab = (id: string) => vocabMap.get(id)
export const getPrep = (id: string) => prepMap.get(id)
export const getNumeral = (id: string) => numeralMap.get(id)
/** Any lexicon item (noun, preposition or numeral) by id. */
export const getLexeme = (id: string): VocabEntry | PrepEntry | NumeralEntry | undefined => vocabMap.get(id) ?? prepMap.get(id) ?? numeralMap.get(id)
export function labelOf(id: string): { ar: string; idn: string } | undefined {
  return getLexeme(id)
}
export const VOCAB_IDS: VocabId[] = VOCAB.map((v) => v.id)
/** Ids usable in every theme (prepositions, numerals). */
export const SHARED_VOCAB_IDS: ReadonlySet<string> = new Set<LexiconId>([...PREPS.map((p) => p.id), ...NUMERALS.map((n) => n.id)])

/** Counting grammar of a Market noun (feeds countedPhrase). Throws for ids that are not countable, which is a content bug. */
export function countedNounOf(entry: CountableEntry | MarketEntityKind): CountedNoun {
  const e = typeof entry === 'string' ? MARKET_COUNTABLES.find((c) => c.id === entry) : entry
  if (!e) throw new Error(`"${String(entry)}" is not a countable Market noun`)
  return { singular: e.ar, ...e.grammar }
}

/** Definite, nominative display name for each entity (used on labels). */
export const NAME_DEFINITE: Record<string, string> = {
  ship: 'السَّفِينَةُ', warehouse: 'الْمَخْزَنُ', crane: 'الرَّافِعَةُ', officer: 'الضَّابِطُ',
  passengers: 'الرُّكَّابُ', captain: 'الرُّبَّانُ', waitingHall: 'صَالَةُ الِانْتِظَارِ',
  cargo: 'الْبِضَاعَةُ', container: 'الْحَاوِيَةُ', lifeboat: 'قَارِبُ النَّجَاةِ', buoy: 'الْعَوَّامَةُ',
  clipboard: 'الْوَرَقَةُ',
  book: 'الْكِتَابُ', pen: 'الْقَلَمُ', shirt: 'الْقَمِيصُ', watch: 'السَّاعَةُ', apple: 'التُّفَّاحَةُ', card: 'الْبِطَاقَةُ',
  seller: 'الْبَائِعُ', customer: 'الزَّبُونُ', shop: 'الْمَتْجَرُ', basket: 'السَّلَّةُ', bag: 'الْكِيسُ', shelf: 'الرَّفُّ',
  scale: 'الْمِيزَانُ', package: 'الطَّرْدُ', ledger: 'الدَّفْتَرُ', receipt: 'الْفَاتُورَةُ', riyal: 'الرِّيَالُ', tag: 'السِّعْرُ',
}
