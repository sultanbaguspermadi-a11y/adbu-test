# Arabic Detective — المُحَقِّقُ اللُّغَوِيُّ

> **Pahami petunjuk. Hubungkan bukti. Pecahkan kasus dengan bahasa Arab.**

Game edukasi bahasa Arab untuk siswa SMK pemula. Pemain menjadi detektif bahasa yang memecahkan 10 kasus di dua distrik: **Pelabuhan** (*الْمِينَاءُ*, 5 kasus: relasi tempat أَمَامَ، خَلْفَ، بِجَانِبِ، بَيْنَ، فِي، قُرْبَ) dan **Pasar** (*التَّسَوُّقُ*, 5 kasus: angka dan jenis benda `'adad–ma'dūd`, harga كَمْ / بِكَمْ, kata sifat). Pemain membaca petunjuk Arab, mengamati adegan, mengumpulkan bukti, lalu menarik kesimpulan.

Proyek ini dibuat sebagai **produk edukasi untuk lomba/demo**, bukan sistem penilaian resmi sekolah.

## Mengapa layak untuk kelas dan juri

- **Berjalan tanpa internet.** Seluruh gameplay, Dalil, dan font (self-host) bekerja offline setelah halaman dimuat. Cloud hanya tambahan untuk analytics dan dashboard guru.
- **Dalil bukan AI.** Dalil adalah *sistem scaffolding berbasis petunjuk bertingkat yang dirancang sebelumnya dan berjalan sepenuhnya offline.* Tidak ada model, API key, atau server. Jawabannya konsisten (input sama → keluaran sama), tidak acak, dan dikontrol secara pedagogis.
- **Tidak membocorkan jawaban akhir.** Tiga tingkat: (1) petunjuk umum, (2) petunjuk spesifik ke kata/kalimat, (3) bantuan bahasa (arti kata/pola). `npm run verify` menolak hint yang menuliskan urutan jawaban.
- **Feedback belajar konsisten.** Kesalahan menjelaskan *kata Arab mana* yang keliru, bukan sekadar "salah".
- **Hasil tidak mudah hilang.** Nilai disimpan lokal dulu; antrean cloud tidak pernah membuang nilai diam-diam.

## Pedagogi: tiap mekanik punya tujuan belajar

| Mekanik | Melatih |
|---|---|
| Hotspot (Case 1) | pengenalan kosakata dari perintah Arab |
| Pilih gambar & Penempatan (Case 2) | relasi tempat / ظرف المكان → posisi nyata di peta |
| Saksi & penempatan tokoh (Case 3) | pemahaman bacaan: pola رَأَيْتُ + tokoh + tempat |
| Papan Bukti & Eliminasi (Case 4) | menghubungkan informasi; inferensi dari kalimat penyangkal لَيْسَ / لَيْسَتْ |
| Inspeksi, kronologi, laporan akhir (Case 5) | integrasi seluruh kemampuan |
| Dalil | scaffolding bertingkat saat siswa kesulitan |

Progresi: **Case 1** mengenal mekanik → **Case 2** posisi/spasial → **Case 3** menghubungkan tokoh dan saksi → **Case 4** analisis bukti → **Case 5** integrasi + laporan akhir.

## Fitur

- 10 kasus (5 per distrik), 11 tipe tugas (termasuk `choice`: gambar → frasa Arab yang benar), semuanya punya alternatif tap/keyboard untuk drag-and-drop.
- XP, bintang, peringkat, 4 pencapaian. Halaman Hasil memberi **rekomendasi belajar deterministik** (mis. "Perlu latihan lagi: بِجَانِبِ dan خَلْفَ.") dan daftar kosakata dikuasai.
- **Mode Presentasi** (Pengaturan): membuka semua kasus untuk demo tanpa mengubah progres utama.
- **Dashboard Guru** (`/teacher`, butuh Supabase): kartu di HP / tabel di laptop, filter nama-kelas-kasus, detail kosakata sulit, ekspor CSV.
- Sinkronisasi cloud yang jujur: status per hasil, antrean persisten, auto-flush saat aplikasi dibuka dan saat internet kembali.
- Responsif ≥ 360px, ARIA, fokus terlihat, target sentuh ≥ 44px, `prefers-reduced-motion`.

## Menjalankan

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # tsc + vite build → dist/
npm test           # Vitest
npm run verify     # verifikasi konten
```

`npm run verify` memeriksa: ID ganda, urutan kasus, referensi clue/evidence/kosakata yang tidak ada, placement yang tidak mungkin diselesaikan, tugas tanpa 3 tingkat hint, hint yang membocorkan urutan, bukti yang dipakai sebelum dikumpulkan (dead end), clue yang tidak pernah dipakai, dan kata Arab yang tidak ada di leksikon Dalil.

## Deploy (Vercel, SPA statis)

Tidak ada serverless function. `vercel.json` hanya me-rewrite route SPA ke `index.html` (refresh `/case/harbor-2` aman; tautan lama `/case/case-2` dialihkan) dan men-cache `/assets`.

Environment variables (opsional, hanya untuk cloud):

```env
VITE_SUPABASE_URL=https://PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=ANON_PUBLIC_KEY
```

Gunakan anon key saja. **Jangan pernah** memasukkan `service_role` key ke variabel `VITE_*`. Panduan database dan akun guru: [`supabase/README.md`](supabase/README.md). Tanpa variabel ini game tetap berjalan penuh; hanya dashboard guru yang nonaktif.

## Arsitektur

```
src/
  app/            router, guards, ErrorBoundary
  components/     common/ · game/ (+ tasks/) · evidence/ · dalil/DalilPanel
  data/           vocabulary, lexicon (glossing Arab), achievements, cases/case1..5
  engine/         spatial, scoring, analytics, recommendation, teacherView, verifyContent
  services/
    dalil/        types · provider (deterministik) · index (askDalil, tangga hint)
    cloud/        supabase (antrean, auto-sync, refresh token guru)
    persistence/  storage (localStorage + fallback memori) · schema (sanitizer)
  stores/         playerStore (persisten) · gameStore (sesi kasus) · uiStore · syncStore
  pages/          Landing, Setup, Tutorial, CaseSelect, CasePage, Results, Achievements, Teacher, Settings
```

Stack: React, TypeScript, Vite, Zustand, Tailwind, Framer Motion, Supabase REST, Vitest.

### Dalil: aturan tangga petunjuk

- Aksi: petunjuk, jelaskan kalimat, jelaskan kata, kenapa salah, bantu analisis bukti. Semuanya fungsi murni di `services/dalil/provider.ts`.
- Level hint naik 1→2→3 hanya lewat tombol "Beri petunjuk". Setelah 3 kesalahan, tangga mulai dari level 2. Setelah level 3, permintaan berikutnya mengulang level 3 (gratis).
- Petunjuk baru dan penjelasan kata/kalimat sedikit mengurangi bintang; "kenapa salah" dan analisis bukti gratis.
- `DalilContext` sengaja tidak memuat kunci jawaban.

### Penyimpanan & pemulihan

`localStorage` (`arabic-detective:v1:*`) dengan fallback memori. Data dibaca lewat sanitizer: JSON korup diperbaiki/dibuang, tidak pernah membuat aplikasi mati. Sesi kasus yang berjalan dipulihkan saat reload. Render error ditangkap `ErrorBoundary` (layar pemulihan, bukan halaman kosong).

### Sinkronisasi cloud

Hasil lokal = sumber utama; cloud = backup. Alur: simpan lokal → masukkan antrean persisten → kirim via RPC `submit_attempt` (idempoten lewat `clientAttemptId`). Gagal → tetap di antrean; dicoba lagi saat startup, `online`, tab aktif, dan backoff berkala. Penolakan permanen server (4xx validasi) ditandai "gagal" dan bisa dicoba manual, tidak diulang tanpa henti.

## Skema skor

Tiap tugas benar +100 XP (+30 bila tanpa petunjuk); selesai kasus +150; +50 per bintang. Akurasi = tugas benar / (benar + salah). ⭐⭐⭐ bila akurasi ≥ 85% dan petunjuk ≤ 3; ⭐⭐ bila ≥ 60%; selain itu ⭐. XP total = XP terbaik per kasus (replay tidak menurunkan skor terbaik dan tidak bisa digrinding). Peringkat: 0 / 1.500 / 3.500 XP.

## Pengaturan tampilan & aksesibilitas

Halaman **Pengaturan** (`/settings`) punya delapan kategori: Tampilan, Tipografi, Membaca Arab, Tata letak, Gerak, Aksesibilitas, Permainan, Data. Semua perubahan langsung berlaku di seluruh aplikasi (tanpa reload), tersimpan di browser, dan punya pratinjau langsung. "Pulihkan tampilan bawaan" hanya mengembalikan tampilan: siswa, progres, nilai, dan pencapaian tidak tersentuh.

| Kelompok | Pilihan |
|---|---|
| Tema | Gelap (bawaan) · Terang · Ikuti sistem. Kertas berkas tetap krem di semua tema. |
| Aksen | Emas (bawaan) · Ambar · Zamrud · Biru · Merah tua |
| Sudut | Tajam · Tipis · Membulat (bawaan) · Sangat bulat |
| Font antarmuka | Inter (bawaan) · Font sistem · IBM Plex Sans · Atkinson Hyperlegible |
| Font Arab | Noto Naskh Arabic (bawaan) · Amiri · Scheherazade New |
| Ukuran teks | Kecil 0,9× · Standar · Besar 1,1× · Sangat besar 1,25×; Arab punya skala sendiri (1× / 1,2× / 1,4×) |
| Jarak baris | Rapat · Nyaman · Longgar (UI dan Arab terpisah) |
| Arab | Perataan Otomatis / Kanan / Tengah, ketebalan Normal / Tebal |
| Kerapatan | Rapat (kontrol 40px) · Nyaman (44px) · Lega (48px) |
| Lebar konten | Sempit 1280px · Standar 1680px · Lebar 2000px (hanya berpengaruh di layar ≥1280px) |
| Gerak | Ikuti sistem · Penuh · Dikurangi · Tanpa animasi; animasi dekoratif, tekstur kertas, grid latar |
| Aksesibilitas | Kontras tinggi, fokus keyboard tebal, mode keterbacaan tinggi, kurangi transparansi |

Default sama dengan tampilan sebelumnya. Font tersimpan lokal (`@fontsource`) dan hanya diunduh browser saat dipakai. "Ikuti sistem" pada Gerak memakai `prefers-reduced-motion`; pilihan eksplisit pengguna selalu didahulukan. Penanda status (benar/salah, bukti ditemukan) tetap tampil pada mode tanpa animasi, hanya tanpa gerakan. Mode keterbacaan tinggi tidak pernah memberi `letter-spacing` pada teks Arab (merusak sambungan huruf).

### Arsitektur (tanpa percabangan gaya di komponen)

```
preferencesStore (zustand, key arabic-detective:v1:prefs)
      │  sanitizePreferences: nilai tak valid kembali ke default per-key
      ▼
theme/apply.ts   preferensi + OS  ──►  atribut data-* pada <html>   (dijalankan sebelum render pertama di main.tsx)
      ▼
styles/theme.css + palette.css   atribut data-*  ──►  variabel CSS
      ▼
tailwind.config.js   warna, radius, ukuran teks, padding/margin/gap, lebar halaman = var(--…)
```

- **Warna:** `src/styles/palette.css` dihasilkan oleh `scripts/generate-theme-tokens.py --css`, yang juga memeriksa kontras WCAG untuk tiap kombinasi tema × aksen (115 pemeriksaan). File hasil di-commit; skrip hanya perlu dijalankan saat warna diubah.
- **`.paper` punya palet sendiri** (tinta navy di atas krem) sehingga tema terang bukan sekadar inversi.
- **Token semantik:** `--color-bg`, `--color-surface`, `--color-text`, `--color-accent`, `--color-paper`, dan seterusnya; plus `--density`, `--control-height`, `--panel-padding`, `--radius-*`, `--ui-font-scale`, `--ar-scale`, `--content-max`.
- **Arab:** semua teks Arab lewat komponen `Ar` (`ar-xs … ar-hero`) sehingga font, skala, bobot, dan jarak baris Arab dikendalikan terpusat. Tambahkan `ar-keep` pada blok yang tata letaknya tidak boleh ikut preferensi perataan.
- **Transparansi:** permukaan semi-transparan memakai kunci alpha semantik (`bg-ink-800/soft`, `/scrim`, `/glass`), yang menjadi solid pada "kurangi transparansi" dan kontras tinggi.

### Menambah preferensi baru
1. Tambahkan nilainya di `ENUMS`/`Preferences` dan `ATTR_NAMES` (`theme/preferences.ts`).
2. Tulis aturan CSS `[data-…='nilai']` di `theme.css`.
3. Tambahkan kontrol di `pages/Settings.tsx`.

Langkah 2 dijaga oleh tes kontrak (`preferences.test.ts`): setiap opsi yang bisa dipilih harus punya aturan CSS, jadi tidak ada pengaturan yang diam-diam tidak berfungsi.

## Distrik dan kasus

Id kasus memakai namespace: `harbor-1…5`, `market-1…5`. Data lama (`case-1…5`) dimigrasikan saat dimuat (`src/data/caseIds.ts`, `services/persistence/schema.ts`); progres Harbor tidak hilang. Pasar terbuka setelah `harbor-2` selesai, lalu `market-1 → market-5` berurutan.

- Registri distrik: `src/themes/registry.ts` (data murni) dan `src/themes/views.tsx` (adegan dan plat). Menambah distrik = menambah `ThemeId`, entri di kedua registri, adegan, dan kasus; kompiler menolak yang belum lengkap.
- Token distrik: `src/styles/district.css` (`data-district="harbor|market"` → warna `district`).
- Kalimat angka dan sifat Pasar dibangkitkan oleh `src/utils/numerals.ts` dan `src/utils/agreement.ts` (diuji), bukan diketik manual.
- `npm run verify` memeriksa: kosakata milik distrik, penomoran per distrik, adegan yang valid, dan **kecocokan gambar dengan jawaban benar** (jumlah, harga, warna, ukuran).

## Keterbatasan yang diketahui

- Tidak ada service worker: halaman harus dimuat sekali dengan internet; setelah itu gameplay tidak membutuhkan internet. Karena tidak ada service worker, memuat ulang halaman saat benar-benar offline tidak didukung.
- Tidak ada anti-cheat (sengaja, aplikasi lomba).
- Teks Arab sebaiknya ditinjau guru bahasa Arab sebelum dipakai di kelas.
