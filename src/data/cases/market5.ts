import type { CaseDefinition, ChoiceTask, InspectTask, ReportTask } from '../../types'
import { adjFor, choiceOf, clue, count, definiteDescribed, forged, riyals, riyalsWrong } from './marketHelpers'

/** M5 · The Merchant's Ledger — review of everything: counting (3–10), prices, and agreement. */
const clues = [
  clue('m5-l1', `فِي الدَّفْتَرِ: ${count(7, 'shirt')}.`, 'Buku catatan: tujuh kemeja.', 'ledger', ['shirt', 'ledger', 'num-7'], true, 'seller'),
  clue('m5-l2', `فِي الدَّفْتَرِ: ${count(9, 'watch')}.`, 'Buku catatan: sembilan jam.', 'ledger', ['watch', 'ledger', 'num-9'], true, 'seller'),
  clue('m5-l3', `سِعْرُ الْقَمِيصِ ${riyals(5)}.`, 'Harga kemeja: lima riyal.', 'receipt', ['shirt', 'riyal', 'num-5'], true, 'seller'),
  clue('m5-l4', `الْقَمِيصُ ${adjFor('shirt', 'blue')}.`, 'Kemeja itu biru.', 'shirt', ['shirt', 'blue'], true, 'seller'),
  clue('m5-l5', `السَّاعَةُ ${adjFor('watch', 'black')}.`, 'Jam itu hitam.', 'watch', ['watch', 'black'], true, 'seller'),
]

const inspect: InspectTask = {
  id: 'm5-t1', type: 'inspect', scene: 'office', titleId: 'Periksa meja pedagang',
  instruction: 'Ketuk benda di kantor pedagang. Simpan yang memuat catatan jumlah atau harga.',
  vocab: ['ledger', 'receipt', 'scale', 'riyal', 'card'],
  entities: [
    { entity: 'ledger', clueId: 'm5-l1', relevant: true },
    { entity: 'receipt', clueId: 'm5-l3', relevant: true },
    { entity: 'scale', relevant: false, why: 'Timbangan menimbang berat, bukan mencatat jumlah atau harga barang.' },
    { entity: 'riyal', relevant: false, why: 'Koin hanya alat bayar. Ia tidak menyebut barang apa pun.' },
    { entity: 'card', relevant: false, why: 'Kartu ini tidak memuat catatan penjualan.' },
  ],
  collects: [],
  hints: ['Cari benda yang ditulisi catatan: ada yang memuat jumlah dan ada yang memuat harga.', 'Buku catatan dan struk adalah dua benda yang memuat tulisan.', 'Timbangan, koin, dan kartu tidak berisi catatan tentang barang.'],
  success: 'Benar. Buku catatan dan struk sudah disimpan. Sekarang hitung dan bandingkan.',
}

const tasks: ChoiceTask[] = [
  { id: 'm5-t2', type: 'choice', titleId: 'Hitung kemeja', instruction: 'Hitung kemeja di gambar, lalu pilih frasa Arab yang tepat.', visual: { kind: 'count', entity: 'shirt', count: 7 }, focusText: count(7, 'shirt'), vocab: ['shirt', 'num-7'],
    ...choiceOf(count(7, 'shirt'), [{ ar: forged(7, 'shirt'), note: 'Kemeja maskulin, jadi angka 3–10 memakai bentuk ber-ة: **سَبْعَةُ**.' }, { ar: count(8, 'shirt'), note: 'Jumlahnya tidak sama dengan gambar.' }], 0),
    hints: ['Hitung kemeja di gambar.', 'Angka 3–10 berlawanan jenis dengan benda.', 'Kemeja maskulin → angka ber-ة.'], success: 'Benar. Tujuh kemeja sesuai buku catatan.' },
  { id: 'm5-t3', type: 'choice', titleId: 'Hitung jam', instruction: 'Hitung jam di gambar, lalu pilih frasa Arab yang tepat.', visual: { kind: 'count', entity: 'watch', count: 9 }, focusText: count(9, 'watch'), vocab: ['watch', 'num-9'], clueId: 'm5-l2', collects: ['m5-l2'],
    ...choiceOf(count(9, 'watch'), [{ ar: forged(9, 'watch'), note: 'Jam feminin, jadi angkanya TANPA ة: **تِسْعُ**.' }, { ar: count(7, 'watch'), note: 'Jumlahnya tidak sama dengan gambar.' }], 2),
    hints: ['Hitung jam di gambar.', 'Angka 3–10 berlawanan jenis dengan benda.', 'Jam feminin → angka tanpa ة.'], success: 'Benar. Sembilan jam tercatat.' },
  { id: 'm5-t4', type: 'choice', titleId: 'Harga kemeja', instruction: 'Baca label harga, lalu pilih jawaban Arab yang benar.', promptAr: 'كَمْ سِعْرُ هَذَا الْقَمِيصِ؟', focusText: 'كَمْ سِعْرُ هَذَا الْقَمِيصِ؟', visual: { kind: 'price', entity: 'shirt', price: 5 }, vocab: ['shirt', 'riyal', 'num-5'],
    ...choiceOf(`سِعْرُهُ ${riyals(5)}.`, [{ ar: `سِعْرُهُ ${riyalsWrong(5)}.`, note: 'Yang dihitung adalah riyal (maskulin), jadi angkanya ber-ة: **خَمْسَةُ**.' }, { ar: `سِعْرُهُ ${riyals(7)}.`, note: 'Angkanya tidak sama dengan label harga.' }], 1),
    hints: ['Baca angka pada label harga.', 'Riyal maskulin, jadi angka 3–10 ber-ة.', 'Gunakan **سِعْرُهُ** untuk benda maskulin.'], success: 'Benar. Harga kemeja lima riyal.' },
  { id: 'm5-t5', type: 'choice', titleId: 'Warna kedua barang', instruction: 'Pilih kalimat Arab yang menyebut warna kemeja dan jam dengan benar.', visual: { kind: 'items', items: [{ entity: 'shirt', color: 'blue' }, { entity: 'watch', color: 'black' }] }, focusText: `${definiteDescribed('الْقَمِيصُ', 'shirt', 'blue')} وَ${definiteDescribed('السَّاعَةُ', 'watch', 'black')}`, vocab: ['shirt', 'watch', 'blue', 'black'], clueId: 'm5-l4', collects: ['m5-l4', 'm5-l5'],
    ...choiceOf(`${definiteDescribed('الْقَمِيصُ', 'shirt', 'blue')} وَ${definiteDescribed('السَّاعَةُ', 'watch', 'black')}`, [{ ar: `${definiteDescribed('الْقَمِيصُ', 'shirt', 'blue')} وَ${definiteDescribed('السَّاعَةُ', 'watch', 'white')}`, note: 'Warna jam di gambar adalah hitam, bukan putih.' }, { ar: `${definiteDescribed('الْقَمِيصُ', 'shirt', 'green')} وَ${definiteDescribed('السَّاعَةُ', 'watch', 'black')}`, note: 'Warna kemeja di gambar adalah biru, bukan hijau.' }], 0),
    hints: ['Lihat warna kemeja dan jam.', 'Kata sifat mengikuti jenis benda.', 'Kemeja maskulin: **الْأَزْرَقُ**. Jam feminin: **السَّوْدَاءُ**.'], success: 'Benar. Warna kemeja dan jam tercatat.' },
]

const report: ReportTask = {
  id: 'm5-t6', type: 'report', titleId: 'Laporan buku catatan',
  instruction: 'Lengkapi laporan akhir. Setiap jawaban harus cocok dengan bukti yang sudah kamu kumpulkan.',
  vocab: ['ledger', 'shirt', 'watch', 'riyal'],
  fields: [
    { key: 'count', labelAr: 'الْعَدَدُ', labelId: 'Barang paling banyak di buku catatan',
      options: [{ id: 'a', ar: count(7, 'shirt') }, { id: 'b', ar: count(9, 'watch') }, { id: 'c', ar: forged(9, 'watch') }], correct: 'b',
      wrongNote: { a: 'Tujuh kurang dari sembilan. Barang paling banyak adalah jam.', c: 'Jumlahnya benar, tetapi bentuk angkanya salah: jam feminin → **تِسْعُ**.' } },
    { key: 'price', labelAr: 'السِّعْرُ', labelId: 'Harga kemeja',
      options: [{ id: 'a', ar: `سِعْرُهُ ${riyalsWrong(5)}` }, { id: 'b', ar: `سِعْرُهُ ${riyals(7)}` }, { id: 'c', ar: `سِعْرُهُ ${riyals(5)}` }], correct: 'c',
      wrongNote: { a: 'Bentuk angkanya salah: riyal maskulin → **خَمْسَةُ**.', b: 'Harga di struk adalah lima, bukan tujuh.' } },
    { key: 'colour', labelAr: 'اللَّوْنُ', labelId: 'Warna jam',
      options: [{ id: 'a', ar: `السَّاعَةُ ${adjFor('watch', 'black')}` }, { id: 'b', ar: `السَّاعَةُ ${adjFor('shirt', 'black')}` }, { id: 'c', ar: `السَّاعَةُ ${adjFor('watch', 'blue')}` }], correct: 'a',
      wrongNote: { b: 'Jam feminin, jadi sifatnya bentuk feminin: **سَوْدَاءُ**.', c: 'Warna jam adalah hitam, bukan biru.' } },
  ],
  hints: ['Setiap kolom bisa dijawab dari dalil yang sudah kamu kumpulkan.', 'Periksa jenis benda sebelum memilih bentuk angka atau kata sifat.', 'Jam feminin, kemeja maskulin, riyal maskulin.'],
  success: 'Laporan lengkap. Semua catatan pedagang kini cocok dengan buktinya.',
}

export const market5: CaseDefinition = {
  id: 'market-5', theme: 'market', number: 5, scene: 'office',
  titleAr: 'دَفْتَرُ التَّاجِرِ', titleId: "The Merchant's Ledger",
  description: 'Gabungkan angka, harga, dan kata sifat untuk menyusun laporan akhir pedagang.',
  story: 'Seorang pedagang ingin menutup buku akhir bulan. Buku catatannya memuat jumlah, harga, dan sifat barang, tetapi sebagian tercecer. Kumpulkan catatan itu dan susun laporan yang benar.',
  difficulty: 4, learningLevel: 'Evaluasi (Evaluating)', mechanic: 'Pemeriksaan meja, pilihan frasa campuran, dan laporan akhir',
  objectives: ['Mengulang angka 3–10, harga, dan kata sifat dalam satu kasus', 'Menerapkan kaidah jenis pada angka dan kata sifat', 'Menyusun laporan akhir dari bukti'],
  vocabulary: ['ledger', 'receipt', 'shirt', 'watch', 'riyal', 'blue', 'black', 'num-5', 'num-7', 'num-9'],
  showVocabMeaning: true,
  clues,
  tasks: [inspect, ...tasks, report],
  solution: { summary: 'Sembilan jam, kemeja seharga lima riyal, jam berwarna hitam.', evidenceIds: ['m5-l2', 'm5-l3', 'm5-l5'] },
  reveal: { lines: [{ ar: clues[1].ar, id: 'm5-l2' }, { ar: clues[2].ar, id: 'm5-l3' }], conclusion: 'تِسْعُ سَاعَاتٍ، وَسِعْرُ الْقَمِيصِ خَمْسَةُ رِيَالَاتٍ، وَالسَّاعَةُ سَوْدَاءُ.' },
}
