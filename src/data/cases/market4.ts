import type { CaseDefinition, ChoiceTask, EliminationTask, HotspotTask, ItemSpec } from '../../types'
import { adjFor, choiceOf, clue, described, describedWrong, definiteDescribed, definiteDescribedWrong, gender, sing } from './marketHelpers'
import type { LexiconId, MarketEntityKind } from '../../types'

/** M4 · The Swapped Packages — adjectives (colour, size) agree with the noun in gender; definite nouns take definite adjectives. */
const clues = [
  clue('m4-find', 'الْقَمِيصُ فِي الطَّرْدِ.', 'Kemeja ada di dalam paket.', 'shirt', ['shirt', 'package', 'fi'], false),
  clue('m4-shirt', `الطَّلَبُ وَالطَّرْدُ: ${described('shirt', 'red')}.`, 'Pesanan dan paket sama: kemeja merah.', 'shirt', ['shirt', 'red', 'package'], true, 'customer'),
  clue('m4-watch', `الطَّلَبُ وَالطَّرْدُ: ${described('watch', 'black')}.`, 'Pesanan dan paket sama: jam hitam.', 'watch', ['watch', 'black', 'package'], true, 'customer'),
  clue('m4-card', `الطَّلَبُ: ${described('card', 'big')}، وَالطَّرْدُ: ${described('card', 'small')}.`, 'Pesanan: kartu besar. Paket: kartu kecil. Isi paket tidak sesuai pesanan!', 'card', ['card', 'big', 'small', 'package'], true, 'customer'),
]

const hotspot: HotspotTask = {
  id: 'm4-t1', type: 'hotspot', scene: 'textile', titleId: 'Temukan kemeja',
  instruction: 'Ketuk benda di lapak yang dimaksud perintah.',
  promptAr: 'اِبْحَثْ عَنِ الْقَمِيصِ', focusText: 'اِبْحَثْ عَنِ الْقَمِيصِ', vocab: ['shirt'],
  target: 'shirt', clueId: 'm4-find', collects: ['m4-find'],
  hints: ['Kemeja adalah pakaian atasan berkerah.', 'Cari kemeja yang digantung di lapak kain.', '**الْقَمِيصُ** berarti "kemeja".'],
  success: 'Benar. Kemeja ada di dalam paket. Sekarang cocokkan sifat tiap barang dengan pesanan.',
}

function describeTask(id: 'shirt' | 'watch' | 'card', a: LexiconId, item: ItemSpec, clueId: string, title: string, wrongA: LexiconId, wrongAt: number): ChoiceTask {
  const n = id as MarketEntityKind
  const fem = gender(n) === 'f'
  return {
    id: `m4-${id}`, type: 'choice', titleId: title,
    instruction: 'Lihat gambar, lalu pilih frasa Arab yang menggambarkannya dengan tepat.',
    visual: { kind: 'items', items: [item] }, focusText: described(n, a),
    vocab: [id, a], clueId, collects: [clueId],
    ...choiceOf(described(n, a), [
      { ar: describedWrong(n, a), note: `Kata sifat harus mengikuti jenis benda. **${sing(n)}** ${fem ? 'feminin, jadi sifatnya bentuk feminin' : 'maskulin, jadi sifatnya bentuk maskulin'}.` },
      wrongA === a ? { ar: `${adjFor(n, a)} ${sing(n)}`, note: 'Kata sifat diletakkan SETELAH bendanya, bukan sebelumnya.' } : { ar: described(n, wrongA), note: 'Sifatnya tidak sesuai gambar. Periksa warna atau ukuran barang.' },
    ], wrongAt),
    hints: ['Perhatikan warna atau ukuran barang di gambar.', 'Kata sifat diletakkan setelah benda dan mengikuti jenisnya (maskulin / feminin).', fem ? `**${sing(n)}** feminin: pakai bentuk sifat feminin (misalnya **${adjFor(n, a)}**).` : `**${sing(n)}** maskulin: pakai bentuk sifat maskulin (misalnya **${adjFor(n, a)}**).`],
    success: 'Benar. Sifat barang sudah dicatat. Bandingkan dengan pesanan di dalil.',
  }
}

const both: ChoiceTask = {
  id: 'm4-t5', type: 'choice', titleId: 'Dua barang sekaligus',
  instruction: 'Benda yang sudah ditentukan memakai kata sifat yang juga diawali ال dan mengikuti jenisnya. Pilih kalimat yang tepat.',
  visual: { kind: 'items', items: [{ entity: 'shirt', color: 'blue' }, { entity: 'watch', color: 'white' }] },
  vocab: ['shirt', 'watch', 'blue', 'white'], focusText: `${definiteDescribed('الْقَمِيصُ', 'shirt', 'blue')} وَ${definiteDescribed('السَّاعَةُ', 'watch', 'white')}`,
  ...choiceOf(`${definiteDescribed('الْقَمِيصُ', 'shirt', 'blue')} وَ${definiteDescribed('السَّاعَةُ', 'watch', 'white')}`, [
    { ar: `${definiteDescribedWrong('الْقَمِيصُ', 'shirt', 'blue')} وَ${definiteDescribed('السَّاعَةُ', 'watch', 'white')}`, note: 'Kemeja maskulin, jadi sifatnya **الْأَزْرَقُ** (maskulin), bukan الزَّرْقَاءُ.' },
    { ar: `${definiteDescribed('الْقَمِيصُ', 'shirt', 'red')} وَ${definiteDescribed('السَّاعَةُ', 'watch', 'white')}`, note: 'Warna kemeja di gambar adalah biru, bukan merah.' },
  ], 2),
  hints: ['Lihat warna kedua barang: kemeja dan jam.', 'Kata sifat harus cocok dengan bendanya dalam jenis dan juga diawali ال.', 'Kemeja maskulin → **الْأَزْرَقُ**. Jam feminin → **الْبَيْضَاءُ**.'],
  success: 'Benar. Kedua kata sifat cocok dengan jenis bendanya.',
}

const elimination: EliminationTask = {
  id: 'm4-t6', type: 'elimination', titleId: 'Paket mana yang tertukar?',
  instruction: 'Singkirkan barang yang isi paketnya sama dengan pesanan. Sisanya yang tertukar.',
  question: 'Pertanyaan penyelidikan: isi paket mana yang TIDAK sesuai dengan pesanan?',
  vocab: ['shirt', 'watch', 'card', 'package'],
  candidates: [{ id: 'shirt', ar: 'قَمِيصٌ', entity: 'shirt' }, { id: 'watch', ar: 'سَاعَةٌ', entity: 'watch' }, { id: 'card', ar: 'بِطَاقَةٌ', entity: 'card' }],
  answer: 'card',
  eliminatedBy: { shirt: ['m4-shirt'], watch: ['m4-watch'] },
  evidenceIds: ['m4-shirt', 'm4-watch', 'm4-card'],
  wrongHint: 'Dalil itu harus menunjukkan pesanan dan isi paket yang SAMA.',
  hints: ['Pada tiap dalil, bandingkan frasa pesanan dengan frasa paket.', 'Kemeja dan jam: pesanan dan paket menyebut sifat yang sama.', 'Kartu: pesanan menyebut **كَبِيرَةٌ** (besar), paket menyebut **صَغِيرَةٌ** (kecil).'],
  success: 'Benar. Pelanggan memesan kartu besar, tetapi paketnya berisi kartu kecil. Paketnya tertukar.',
}

export const market4: CaseDefinition = {
  id: 'market-4', theme: 'market', number: 4, scene: 'textile',
  titleAr: 'الطُّرُودُ الْمُتَبَادَلَةُ', titleId: 'The Swapped Packages',
  description: 'Cocokkan warna dan ukuran barang dengan pesanan, lalu temukan paket yang tertukar.',
  story: 'Dua pelanggan mengambil paket di lapak kain, dan salah satunya mengeluh isinya tidak cocok. Baca sifat setiap barang dalam bahasa Arab, bandingkan dengan pesanan, dan temukan paket yang tertukar.',
  difficulty: 3, learningLevel: 'Analisis (Analyzing)', mechanic: 'Memilih kata sifat yang sesuai jenis benda dan membandingkan dua catatan',
  objectives: ['Mencocokkan kata sifat dengan jenis benda: قَمِيصٌ أَحْمَرُ، سَاعَةٌ سَوْدَاءُ', 'Memakai kata sifat dengan benda yang ditentukan: الْقَمِيصُ الْأَزْرَقُ', 'Membandingkan pesanan dan isi paket'],
  vocabulary: ['shirt', 'watch', 'card', 'package', 'red', 'blue', 'black', 'white', 'big', 'small'],
  showVocabMeaning: true,
  clues,
  tasks: [hotspot, describeTask('shirt', 'red', { entity: 'shirt', color: 'red' }, 'm4-shirt', 'Warna kemeja', 'red', 1), describeTask('watch', 'black', { entity: 'watch', color: 'black' }, 'm4-watch', 'Warna jam', 'white', 0), describeTask('card', 'small', { entity: 'card', size: 'small' }, 'm4-card', 'Ukuran kartu', 'big', 2), both, elimination],
  solution: { summary: 'Pesanan meminta kartu besar, tetapi paket berisi kartu kecil.', evidenceIds: ['m4-card'] },
  reveal: { lines: [{ ar: clues[3].ar, id: 'm4-card' }], conclusion: 'Pesanan: بِطَاقَةٌ كَبِيرَةٌ. Paket: بِطَاقَةٌ صَغِيرَةٌ. Paketnya tertukar.' },
}
