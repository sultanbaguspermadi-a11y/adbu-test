import type { CaseDefinition, ChoiceTask, EliminationTask, HotspotTask } from '../../types'
import { choiceOf, clue, count, forged, RULE_AGREE, sing } from './marketHelpers'

/** M1 · The Missing Stock — numbers 1–2 follow the noun and agree with its gender. */
const ledgerLine = (n: 1 | 2, id: 'book' | 'pen' | 'watch' | 'card') => `فِي الدَّفْتَرِ ${count(n, id)}`
const shelfLine = (n: 1 | 2, id: 'book' | 'pen' | 'watch' | 'card') => `عَلَى الرَّفِّ ${count(n, id)}`

const clues = [
  clue('m1-shelf', 'الرَّفُّ فِي الْمَتْجَرِ.', 'Rak berada di toko.', 'shelf', ['shelf', 'shop', 'fi'], false),
  clue('m1-book', `${ledgerLine(1, 'book')}، وَ${shelfLine(1, 'book')}.`, 'Di buku catatan: satu buku, dan di rak: satu buku. Jumlahnya sama.', 'book', ['book', 'ledger', 'shelf', 'num-1'], true, 'seller'),
  clue('m1-pen', `${ledgerLine(2, 'pen')}، وَ${shelfLine(1, 'pen')}.`, 'Di buku catatan: dua pena, tetapi di rak hanya satu pena. Ada yang hilang!', 'pen', ['pen', 'ledger', 'shelf', 'num-1', 'num-2'], true, 'seller'),
  clue('m1-watch', `${ledgerLine(1, 'watch')}، وَ${shelfLine(1, 'watch')}.`, 'Di buku catatan: satu jam, dan di rak: satu jam. Jumlahnya sama.', 'watch', ['watch', 'ledger', 'shelf', 'num-1'], true, 'seller'),
  clue('m1-card', `${ledgerLine(2, 'card')}، وَ${shelfLine(2, 'card')}.`, 'Di buku catatan: dua kartu, dan di rak: dua kartu. Jumlahnya sama.', 'card', ['card', 'ledger', 'shelf', 'num-2'], true, 'seller'),
]

const hotspot: HotspotTask = {
  id: 'm1-t1', type: 'hotspot', scene: 'shop', titleId: 'Temukan rak toko',
  instruction: 'Ketuk benda di toko yang dimaksud perintah.',
  promptAr: 'اِبْحَثْ عَنِ الرَّفِّ', focusText: 'اِبْحَثْ عَنِ الرَّفِّ', vocab: ['shelf'],
  target: 'shelf', clueId: 'm1-shelf', collects: ['m1-shelf'],
  hints: ['Lihat gambar toko. Rak adalah papan tempat barang disusun.', 'Cari benda berupa papan bersusun di sisi kiri toko.', '**الرَّفُّ** berarti "rak". Kata **عَنِ** berarti "tentang / untuk": perintahnya menyuruh mencari rak.'],
  success: 'Benar. Rak ada di toko. Sekarang bandingkan isi rak dengan buku catatan penjual.',
}

function countTask(n: 1 | 2, id: 'book' | 'pen' | 'watch' | 'card', clueId: string, title: string, wrongAt: number): ChoiceTask {
  const female = id === 'watch' || id === 'card'
  const other: 1 | 2 = n === 1 ? 2 : 1
  const opts = choiceOf(
    count(n, id),
    [
      { ar: forged(n, id), note: `Jenis angka salah. **${sing(id)}** ${female ? 'feminin, jadi angkanya mengikuti bentuk feminin' : 'maskulin, jadi angkanya mengikuti bentuk maskulin'}. ${RULE_AGREE}` },
      { ar: count(other, id), note: `Jumlahnya tidak sama dengan gambar: di rak ada **${n}** ${n === 1 ? 'benda' : 'benda (dua)'}.` },
    ],
    wrongAt,
  )
  return {
    id: `m1-${id}`, type: 'choice', titleId: title,
    instruction: `Hitung benda di rak, lalu pilih frasa Arab yang tepat untuk jumlahnya.`,
    visual: { kind: 'count', entity: id, count: n }, focusText: count(n, id),
    vocab: [id, n === 1 ? 'num-1' : 'num-2', 'shelf'], clueId, collects: [clueId], ...opts,
    hints: [
      'Hitung dulu berapa benda di gambar: satu atau dua?',
      `${RULE_AGREE} Pilih frasa yang bentuknya cocok dengan jenis bendanya.`,
      female ? `**${sing(id)}** adalah benda feminin. Angkanya memakai bentuk feminin (ada ة pada **وَاحِدَةٌ**, atau **اثْنَتَانِ**).` : `**${sing(id)}** adalah benda maskulin. Angkanya memakai bentuk maskulin: **وَاحِدٌ** atau **اثْنَانِ**.`,
    ],
    success: 'Benar. Jumlah di rak sudah dicatat. Bandingkan dengan buku catatan di dalil.',
  }
}

const elimination: EliminationTask = {
  id: 'm1-t6', type: 'elimination', titleId: 'Barang mana yang kurang?',
  instruction: 'Bandingkan buku catatan dan rak. Singkirkan barang yang jumlahnya sama, sampai tersisa barang yang kurang.',
  question: 'Pertanyaan penyelidikan: jumlah barang mana di rak yang TIDAK sama dengan buku catatan?',
  vocab: ['book', 'pen', 'watch', 'card', 'ledger', 'shelf'],
  candidates: [
    { id: 'book', ar: 'كِتَابٌ', entity: 'book' }, { id: 'pen', ar: 'قَلَمٌ', entity: 'pen' },
    { id: 'watch', ar: 'سَاعَةٌ', entity: 'watch' }, { id: 'card', ar: 'بِطَاقَةٌ', entity: 'card' },
  ],
  answer: 'pen',
  eliminatedBy: { book: ['m1-book'], watch: ['m1-watch'], card: ['m1-card'] },
  evidenceIds: ['m1-book', 'm1-pen', 'm1-watch', 'm1-card'],
  wrongHint: 'Dalil yang tepat menunjukkan jumlah di buku catatan SAMA dengan jumlah di rak.',
  hints: ['Kartu dalil memuat dua jumlah: di buku catatan dan di rak. Bandingkan keduanya.', 'Singkirkan barang yang kedua jumlahnya sama. Barang yang jumlahnya berbeda tidak bisa disingkirkan.', 'Cari dua frasa angka dalam satu kalimat dalil. **قَلَمَانِ اثْنَانِ** (dua pena) berbeda dari **قَلَمٌ وَاحِدٌ** (satu pena).'],
  success: 'Benar. Di buku catatan tertulis dua pena, tetapi di rak hanya ada satu: satu pena hilang.',
}

export const market1: CaseDefinition = {
  id: 'market-1', theme: 'market', number: 1, scene: 'shop',
  titleAr: 'الْمَخْزُونُ النَّاقِصُ', titleId: 'The Missing Stock',
  description: 'Bandingkan buku catatan dengan isi rak dan temukan barang yang kurang.',
  story: 'Penjual toko kelontong yakin ada barang yang hilang dari rak. Ia mencatat semuanya di buku catatan. Hitung isi rak, baca jumlahnya dalam bahasa Arab, lalu cari barang yang tidak cocok.',
  difficulty: 1, learningLevel: 'Pemahaman (Understanding)', mechanic: 'Menghitung benda, memilih frasa angka, dan menyingkirkan yang cocok',
  objectives: ['Menyebut jumlah satu dan dua: كِتَابٌ وَاحِدٌ، قَلَمَانِ اثْنَانِ', 'Mencocokkan angka dengan jenis benda (maskulin / feminin)', 'Membandingkan dua catatan jumlah untuk menemukan selisih'],
  vocabulary: ['book', 'pen', 'watch', 'card', 'ledger', 'shelf', 'shop', 'num-1', 'num-2'],
  showVocabMeaning: true,
  clues,
  tasks: [hotspot, countTask(1, 'book', 'm1-book', 'Hitung buku', 1), countTask(2, 'pen', 'm1-pen', 'Hitung pena', 0), countTask(1, 'watch', 'm1-watch', 'Hitung jam', 2), countTask(2, 'card', 'm1-card', 'Hitung kartu', 1), elimination],
  solution: { summary: 'Buku catatan mencatat dua pena, tetapi rak hanya berisi satu pena. Satu pena hilang.', evidenceIds: ['m1-pen'] },
  reveal: { lines: [{ ar: clues[2].ar, id: 'm1-pen' }], conclusion: 'Buku catatan menulis dua pena (قَلَمَانِ اثْنَانِ), sedangkan di rak hanya ada satu (قَلَمٌ وَاحِدٌ).' },
}
