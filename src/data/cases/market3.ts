import type { CaseDefinition, ChoiceTask, EliminationTask, HotspotTask } from '../../types'
import type { NumeralValue } from '../../utils/numerals'
import { choiceOf, clue, gender, riyals, riyalsWrong, RULE_POLARITY, sing } from './marketHelpers'

/** M3 · The Mysterious Price — prices with كَمْ / بِكَمْ. The counted noun is "riyal" (masculine), whatever the item's gender. */
type Item = 'apple' | 'book' | 'watch'
const itemDef: Record<Item, string> = { apple: 'التُّفَّاحَةِ', book: 'الْكِتَابِ', watch: 'السَّاعَةِ' }
const ledger = (id: Item, n: NumeralValue) => `سِعْرُ ${itemDef[id]} ${riyals(n)}.`

const clues = [
  clue('m3-apple', ledger('apple', 3), 'Buku catatan: harga apel tiga riyal.', 'ledger', ['apple', 'ledger', 'riyal', 'num-3'], true, 'seller'),
  clue('m3-book', ledger('book', 5), 'Buku catatan: harga buku lima riyal.', 'ledger', ['book', 'ledger', 'riyal', 'num-5'], true, 'seller'),
  clue('m3-watch', ledger('watch', 8), 'Buku catatan: harga jam delapan riyal.', 'ledger', ['watch', 'ledger', 'riyal', 'num-8'], true, 'seller'),
]

const hotspot: HotspotTask = {
  id: 'm3-t1', type: 'hotspot', scene: 'shop', titleId: 'Temukan buku catatan',
  instruction: 'Ketuk benda di toko yang dimaksud perintah.',
  promptAr: 'اِبْحَثْ عَنِ الدَّفْتَرِ', focusText: 'اِبْحَثْ عَنِ الدَّفْتَرِ', vocab: ['ledger'],
  target: 'ledger', clueId: 'm3-apple', collects: ['m3-apple', 'm3-book', 'm3-watch'],
  hints: ['Buku catatan berada di meja toko.', 'Cari buku bersampul merah di dekat penjual.', '**الدَّفْتَرُ** berarti "buku catatan".'],
  success: 'Benar. Buku catatan memuat harga tiga barang. Sekarang periksa label harga di rak.',
}

function priceTask(id: Item, n: NumeralValue, question: string, answerAr: string, wrongs: { ar: string; note: string }[], title: string, wrongAt: number): ChoiceTask {
  const fem = gender(id) === 'f'
  return {
    id: `m3-${id}`, type: 'choice', titleId: title,
    instruction: 'Baca label harga (angka), lalu pilih jawaban Arab yang benar untuk pertanyaan penjual.',
    promptAr: question, focusText: question,
    visual: { kind: 'price', entity: id, price: n }, vocab: [id, 'riyal', `num-${n}`, 'tag'],
    ...choiceOf(answerAr, wrongs, wrongAt),
    hints: [
      'Lihat angka pada label harga di gambar. Itulah harga yang harus kamu ucapkan.',
      `Yang dihitung adalah **رِيَالٌ** (riyal), benda MASKULIN, bukan ${sing(id)}. ${RULE_POLARITY}`,
      fem ? `Walaupun **${sing(id)}** feminin, angkanya mengikuti **riyal** yang maskulin: pakai bentuk ber-ة.` : 'Riyal maskulin, jadi angka 3–10 memakai bentuk ber-ة.',
    ],
    success: 'Benar. Harga sudah diucapkan dengan bentuk angka yang tepat.',
  }
}

const tasks = [
  hotspot,
  priceTask('apple', 3, 'كَمْ سِعْرُ هَذِهِ التُّفَّاحَةِ؟', `سِعْرُهَا ${riyals(3)}.`, [
    { ar: `سِعْرُهَا ${riyalsWrong(3)}.`, note: 'Yang dihitung adalah riyal (maskulin), bukan apel. Jadi angkanya tetap **ثَلَاثَةُ**.' },
    { ar: `سِعْرُهَا ${riyals(4)}.`, note: 'Angkanya tidak sama dengan label harga di gambar.' },
  ], 'Harga apel', 1),
  priceTask('book', 5, 'بِكَمْ هَذَا الْكِتَابُ؟', `هُوَ بِ${riyals(5, { case: 'genitive' })}.`, [
    { ar: `هُوَ بِ${riyalsWrong(5, { case: 'genitive' })}.`, note: 'Riyal maskulin, jadi angkanya **خَمْسَةِ** (ber-ة), dan berakhiran kasrah setelah **بِ**.' },
    { ar: `هُوَ بِ${riyals(3, { case: 'genitive' })}.`, note: 'Angkanya tidak sama dengan label harga di gambar.' },
  ], 'Harga buku', 0),
  priceTask('watch', 6, 'كَمْ سِعْرُ هَذِهِ السَّاعَةِ؟', `سِعْرُهَا ${riyals(6)}.`, [
    { ar: `سِعْرُهَا ${riyalsWrong(6)}.`, note: 'Jebakan! Jam memang feminin, tetapi yang dihitung adalah **riyal** (maskulin). Pakai **سِتَّةُ**.' },
    { ar: `سِعْرُهَا ${riyals(8)}.`, note: 'Itu harga di buku catatan, bukan angka pada label di gambar. Baca angka label dengan teliti.' },
  ], 'Harga jam', 2),
]

const elimination: EliminationTask = {
  id: 'm3-t5', type: 'elimination', titleId: 'Label harga mana yang janggal?',
  instruction: 'Label di rak: apel 3, buku 5, jam 6. Singkirkan barang yang labelnya cocok dengan buku catatan.',
  question: 'Pertanyaan penyelidikan: harga barang mana di label yang TIDAK sama dengan buku catatan?',
  vocab: ['apple', 'book', 'watch', 'ledger', 'tag', 'riyal'],
  candidates: [{ id: 'apple', ar: 'تُفَّاحَةٌ', entity: 'apple' }, { id: 'book', ar: 'كِتَابٌ', entity: 'book' }, { id: 'watch', ar: 'سَاعَةٌ', entity: 'watch' }],
  answer: 'watch',
  eliminatedBy: { apple: ['m3-apple'], book: ['m3-book'] },
  evidenceIds: ['m3-apple', 'm3-book', 'm3-watch'],
  wrongHint: 'Dalil itu harus menyebut harga yang SAMA dengan angka pada label.',
  hints: ['Bandingkan angka pada label dengan angka dalam kalimat Arab buku catatan.', 'Apel: label 3. Buku: label 5. Jam: label 6. Cocokkan dengan kalimat dalil masing-masing.', '**ثَمَانِيَةُ** berarti 8, tetapi label jam menunjukkan 6. Harganya berbeda.'],
  success: 'Benar. Buku catatan menulis jam delapan riyal, tetapi labelnya enam riyal. Label jam diubah.',
}

export const market3: CaseDefinition = {
  id: 'market-3', theme: 'market', number: 3, scene: 'shop',
  titleAr: 'السِّعْرُ الْغَامِضُ', titleId: 'The Mysterious Price',
  description: 'Ucapkan harga dengan كَمْ dan بِكَمْ, lalu temukan label harga yang diubah.',
  story: 'Seorang pelanggan merasa harga jam di rak lebih murah daripada yang ia dengar kemarin. Baca label harga, jawab pertanyaan penjual dalam bahasa Arab, lalu bandingkan dengan buku catatan.',
  difficulty: 3, learningLevel: 'Penerapan (Applying)', mechanic: 'Membaca label harga, menjawab كَمْ / بِكَمْ, dan menyingkirkan label yang cocok',
  objectives: ['Menanyakan harga dengan كَمْ dan بِكَمْ', 'Menyebut harga: yang dihitung adalah رِيَالٌ (maskulin)', 'Membandingkan harga pada dua sumber'],
  vocabulary: ['apple', 'book', 'watch', 'riyal', 'tag', 'ledger', 'num-3', 'num-5', 'num-6', 'num-8'],
  showVocabMeaning: true,
  clues,
  tasks: [...tasks, elimination],
  solution: { summary: 'Buku catatan menulis harga jam delapan riyal, tetapi label di rak menunjukkan enam.', evidenceIds: ['m3-watch'] },
  reveal: { lines: [{ ar: clues[2].ar, id: 'm3-watch' }], conclusion: 'Harga jam di buku catatan ثَمَانِيَةُ رِيَالَاتٍ (8), tetapi labelnya hanya 6.' },
}
