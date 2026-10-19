import { Link } from 'react-router-dom'
import { Button } from '../components/common/Button'
import { Ar } from '../components/common/RichText'

export function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-4 text-center">
      <div>
        <p className="docno">404 · BERKAS TIDAK ADA</p>
        <Ar size="hero" className="mt-2 block text-gold-400">لَا دَلِيلَ</Ar>
        <h1 className="mt-2 text-xl font-bold">Halaman tidak ditemukan</h1>
        <p className="mt-1 text-sm text-cream-300">Petunjuk ini tidak mengarah ke mana pun.</p>
        <Link to="/"><Button variant="primary" className="mt-5">Kembali ke awal</Button></Link>
      </div>
    </main>
  )
}
