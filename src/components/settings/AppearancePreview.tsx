import { Ar } from '../common/RichText'
import { Button } from '../common/Button'

/**
 * Live preview. It has no props on purpose: it is built from the same global classes as the rest of the app,
 * so it always shows exactly what the preferences produce everywhere.
 */
export function AppearancePreview() {
  return (
    <section className="panel p-4" aria-label="Pratinjau tampilan" data-testid="appearance-preview">
      <p className="label">Pratinjau</p>
      <h3 className="mt-1 text-lg font-bold leading-snug">Contoh antarmuka penyelidikan</h3>
      <p className="mt-1 text-sm text-cream-300">Teks Indonesia biasa memakai font antarmuka, dengan ukuran dan jarak baris pilihanmu.</p>
      <Ar size="lg" className="mt-3 block">يَبْحَثُ الْمُحَقِّقُ عَنِ الدَّلِيلِ فِي الْغُرْفَةِ</Ar>
      <p className="docno mt-2">BERKAS NO. AD-001 · 12 BUKTI</p>
      <div className="paper mt-3 p-4">
        <p className="label">Catatan lapangan</p>
        <p className="mt-1 text-sm">Petunjuk 2/3: <Ar size="sm">الدَّلِيلُ أَمَامَ الْبَابِ</Ar></p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Button variant="primary" size="sm">Verifikasi bukti</Button>
          <Button size="sm">Kembali</Button>
          <span className="stamp stamp-green">Terverifikasi</span>
        </div>
      </div>
    </section>
  )
}
