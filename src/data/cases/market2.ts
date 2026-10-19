import type { CaseDefinition, ChoiceTask, DialogueTask, HotspotTask } from '../../types'
import type { NumeralValue } from '../../utils/numerals'
import { choiceOf, clue, count, forged, gender, RULE_POLARITY, sing } from './marketHelpers'

/** M2 · The Wrong Order — numbers 3–10 take the OPPOSITE gender and a plural genitive noun. */
type G = 'book' | 'watch' | 'pen' | 'card'
const slip = (n: NumeralValue, id: G, wrong = false) => `الطَّلَبُ: ${wrong ? forged(n, id) : count(n, id)}.`
const parcel = (n: NumeralValue, id: G) => `فِي الطَّرْدِ ${count(n, id)}.`

const clues = [
  clue('m2-s1', slip(3, 'book'), 'Pesanan: tiga buku. Penulisannya benar.', 'receipt', ['book', 'package', 'num-3'], false, 'seller'),
  clue('m2-s2', slip(5, 'watch'), 'Pesanan: lima jam. Penulisannya benar.', 'receipt', ['watch', 'num-5'], false, 'seller'),
  clue('m2-s3', slip(4, 'pen', true), 'Pesanan: empat pena, tetapi bentuk angkanya SALAH. Pena maskulin, jadi seharusnya أَرْبَعَةُ.', 'receipt', ['pen', 'num-4'], true, 'seller'),
  clue('m2-s4', slip(6, 'card', true), 'Pesanan: enam kartu, tetapi bentuk angkanya SALAH. Kartu feminin, jadi seharusnya سِتُّ.', 'receipt', ['card', 'num-6'], true, 'seller'),
  clue('m2-p1', parcel(3, 'book'), 'Di dalam paket: tiga buku.', 'package', ['book', 'package', 'num-3'], true, 'seller'),
  clue('m2-p2', parcel(5, 'watch'), 'Di dalam paket: lima jam.', 'package', ['watch', 'package', 'num-5'], true, 'seller'),
  clue('m2-p3', parcel(4, 'pen'), 'Di dalam paket: empat pena.', 'package', ['pen', 'package', 'num-4'], true, 'seller'),
  clue('m2-p4', parcel(6, 'card'), 'Di dalam paket: enam kartu.', 'package', ['card', 'package', 'num-6'], true, 'seller'),
]

const hotspot: HotspotTask = {
  id: 'm2-t1', type: 'hotspot', scene: 'storage', titleId: 'Temukan struk pesanan',
  instruction: 'Ketuk benda di gudang yang dimaksud perintah.',
  promptAr: 'اِبْحَثْ عَنِ الْفَاتُورَةِ', focusText: 'اِبْحَثْ عَنِ الْفَاتُورَةِ', vocab: ['receipt'],
  target: 'receipt', clueId: 'm2-s1', collects: ['m2-s1', 'm2-s2', 'm2-s3', 'm2-s4'],
  hints: ['Struk adalah kertas bukti pesanan. Lihat benda berupa kertas panjang.', 'Cari kertas putih bergerigi di bagian bawah gudang.', '**الْفَاتُورَةُ** berarti "struk / faktur".'],
  success: 'Benar. Struk pesanan memuat empat baris. Baca baris-barisnya dengan teliti.',
}

function countTask(n: NumeralValue, id: G, title: string, clueId: string, wrongAt: number): ChoiceTask {
  const fem = gender(id) === 'f'
  const opts = choiceOf(
    count(n, id),
    [
      { ar: forged(n, id), note: `Angka berlawanan jenis dengan bendanya. **${sing(id)}** ${fem ? 'feminin, jadi angkanya TANPA ة' : 'maskulin, jadi angkanya BERTĀ\' MARBŪṬA (ة)'}. ${RULE_POLARITY}` },
      { ar: `${sing(id)} ${count(n, id).split(' ')[0]}`, note: 'Urutannya terbalik. Untuk angka 3–10, angka ditulis SEBELUM bendanya, dan bendanya jamak.' },
    ],
    wrongAt,
  )
  return {
    id: `m2-${id}`, type: 'choice', titleId: title,
    instruction: 'Hitung isi paket, lalu pilih frasa Arab yang tepat untuk jumlahnya.',
    visual: { kind: 'count', entity: id, count: n }, focusText: count(n, id),
    vocab: [id, `num-${n}`, 'package'], clueId, collects: [clueId], ...opts,
    hints: [
      `Hitung dulu: ada ${n} benda di paket.`,
      `${RULE_POLARITY}`,
      fem ? `**${sing(id)}** feminin → pilih angka TANPA ة (misalnya ${count(n, id).split(' ')[0]}).` : `**${sing(id)}** maskulin → pilih angka dengan ة (misalnya ${count(n, id).split(' ')[0]}).`,
    ],
    success: 'Benar. Isi paket sudah dicatat. Bandingkan dengan baris pada struk.',
  }
}

const dialogue: DialogueTask = {
  id: 'm2-t6', type: 'dialogue', titleId: 'Baris struk yang salah',
  instruction: 'Tandai baris struk yang bentuk angkanya SALAH. Bandingkan dengan isi paket di dalil.',
  question: 'Pertanyaan penyelidikan: baris pesanan mana yang ditulis dengan bentuk angka yang salah?',
  vocab: ['pen', 'card', 'receipt', 'num-4', 'num-6'],
  statementIds: ['m2-s1', 'm2-s2', 'm2-s3', 'm2-s4'], relevant: ['m2-s3', 'm2-s4'],
  reasons: {
    'm2-s1': 'Benar penulisannya: buku maskulin → ثَلَاثَةُ (dengan ة).',
    'm2-s2': 'Benar penulisannya: jam feminin → خَمْسُ (tanpa ة).',
    'm2-s3': 'SALAH: pena maskulin, jadi harus أَرْبَعَةُ, bukan أَرْبَعُ.',
    'm2-s4': 'SALAH: kartu feminin, jadi harus سِتُّ, bukan سِتَّةُ.',
  },
  hints: ['Cocokkan tiap baris struk dengan baris yang sama di isi paket.', 'Lihat jenis bendanya: maskulin atau feminin? Lalu periksa apakah angkanya berlawanan jenis.', 'Dua baris memakai angka yang jenisnya SAMA dengan bendanya. Itulah yang salah.'],
  success: 'Benar. Dua baris pada struk memakai bentuk angka yang salah. Struk itu dipalsukan oleh orang yang tidak paham kaidah ini.',
}

export const market2: CaseDefinition = {
  id: 'market-2', theme: 'market', number: 2, scene: 'storage',
  titleAr: 'الطَّلَبُ الْخَاطِئُ', titleId: 'The Wrong Order',
  description: 'Periksa struk pesanan dan temukan baris yang ditulis dengan bentuk angka yang salah.',
  story: 'Seorang pelanggan menerima paket, tetapi struk pesanannya terasa janggal. Hitung isi paket, bandingkan dengan struk, lalu cari baris yang angkanya ditulis dengan jenis yang keliru.',
  difficulty: 2, learningLevel: 'Penerapan (Applying)', mechanic: 'Menghitung, memilih bentuk angka berlawanan jenis, dan menandai baris yang salah',
  objectives: ['Memakai angka 3–10 sebelum benda jamak', 'Menerapkan kaidah angka berlawanan jenis dengan benda', 'Menemukan kesalahan jenis angka pada sebuah struk'],
  vocabulary: ['book', 'watch', 'pen', 'card', 'package', 'receipt', 'num-3', 'num-4', 'num-5', 'num-6'],
  showVocabMeaning: true,
  clues,
  tasks: [hotspot, countTask(3, 'book', 'Hitung buku', 'm2-p1', 1), countTask(5, 'watch', 'Hitung jam', 'm2-p2', 0), countTask(4, 'pen', 'Hitung pena', 'm2-p3', 2), countTask(6, 'card', 'Hitung kartu', 'm2-p4', 1), dialogue],
  solution: { summary: 'Baris pena dan kartu pada struk memakai bentuk angka yang jenisnya sama dengan bendanya, padahal seharusnya berlawanan.', evidenceIds: ['m2-s3', 'm2-s4'] },
  reveal: { lines: [{ ar: clues[2].ar, id: 'm2-s3' }, { ar: clues[3].ar, id: 'm2-s4' }], conclusion: 'Pena maskulin → أَرْبَعَةُ أَقْلَامٍ. Kartu feminin → سِتُّ بِطَاقَاتٍ. Struk itu menulis sebaliknya.' },
}
