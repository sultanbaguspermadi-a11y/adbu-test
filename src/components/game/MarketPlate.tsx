import { motion } from 'framer-motion'
import { useMotion } from '../../theme/useAppearance'

const ACCENT = '#E87C54'
const PINS: [number, number][] = [[141, 210], [500, 445], [337, 222], [523, 222], [700, 210]]
const ROUTE = 'M141 210 C 190 340, 430 330, 500 445 S 300 300, 337 222 S 480 300, 523 222 S 670 300, 700 210'

/** Survey plate of the market district. Pure illustration (aria-hidden): shop, stalls, office, warehouse, square and the five case locations. */
export function MarketPlate({ className = '' }: { className?: string }) {
  const { decorative } = useMotion()
  return (
    <svg viewBox="0 0 800 560" className={className} aria-hidden role="presentation" fontFamily="'IBM Plex Mono', ui-monospace, monospace">
      <defs>
        <pattern id="mp-sq" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)">
          <line x1="0" y1="0" x2="0" y2="14" stroke="#B9AE98" strokeOpacity=".22" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="800" height="560" fill="#0A121C" />
      {Array.from({ length: 19 }).map((_, i) => <line key={`v${i}`} x1={i * 40 + 40} y1="0" x2={i * 40 + 40} y2="560" stroke="#A3B4C6" strokeOpacity={(i + 1) % 4 === 0 ? 0.16 : 0.06} />)}
      {Array.from({ length: 13 }).map((_, i) => <line key={`h${i}`} x1="0" y1={i * 40 + 40} x2="800" y2={i * 40 + 40} stroke="#A3B4C6" strokeOpacity={(i + 1) % 4 === 0 ? 0.16 : 0.06} />)}
      {/* street + square */}
      <rect x="0" y="300" width="800" height="40" fill="#16263A" stroke="#46627F" />
      <text x="16" y="324" fontSize="10" letterSpacing="3" fill="#7389A0">JALAN PASAR</text>
      <rect x="56" y="372" width="300" height="144" fill="url(#mp-sq)" stroke="#A3B4C6" strokeOpacity=".5" />
      <text x="66" y="390" fontSize="10" letterSpacing="2" fill="#A3B4C6">ALUN-ALUN</text>
      {/* shop, stalls, office */}
      {[[56, 150, 170, 120, 'TOKO'], [640, 150, 120, 120, 'KANTOR']].map(([x, y, w, h, t]) => (
        <g key={String(t)}>
          <rect x={x as number} y={y as number} width={w as number} height={h as number} fill="#16263A" stroke="#A3B4C6" strokeOpacity=".7" />
          <line x1={x as number} y1={(y as number) + 18} x2={(x as number) + (w as number)} y2={(y as number) + 18} stroke="#A3B4C6" strokeOpacity=".35" />
          <text x={(x as number) + 10} y={(y as number) + 13} fontSize="10" letterSpacing="2" fill="#A3B4C6">{t}</text>
        </g>
      ))}
      {[[262, 'LAPAK BUAH'], [448, 'LAPAK KAIN']].map(([x, t]) => (
        <g key={String(t)}>
          <rect x={x as number} y="170" width="150" height="100" fill="#16263A" stroke="#A3B4C6" strokeOpacity=".7" />
          {Array.from({ length: 6 }).map((_, i) => <rect key={i} x={(x as number) + i * 25} y="170" width="25" height="18" fill={i % 2 ? '#2C4560' : '#B8452A'} opacity=".85" />)}
          <text x={(x as number) + 8} y="208" fontSize="10" letterSpacing="2" fill="#A3B4C6">{t}</text>
        </g>
      ))}
      {/* warehouse: crates */}
      <rect x="400" y="380" width="200" height="130" fill="#16263A" stroke="#A3B4C6" strokeOpacity=".7" />
      <text x="410" y="396" fontSize="10" letterSpacing="2" fill="#A3B4C6">GUDANG</text>
      {Array.from({ length: 3 }).flatMap((_, r) => Array.from({ length: 5 }).map((__, c) => <rect key={`${r}-${c}`} x={412 + c * 36} y={408 + r * 32} width="30" height="26" fill={(r + c) % 2 ? '#2C4560' : '#1E3249'} stroke="#46627F" />))}
      {/* route + pins */}
      <motion.path d={ROUTE} fill="none" stroke={ACCENT} strokeWidth="2" strokeDasharray="7 6" initial={decorative ? { pathLength: 0 } : false} animate={{ pathLength: 1 }} transition={{ duration: 1.6, ease: 'easeInOut' }} />
      {PINS.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="13" fill={ACCENT} stroke="#0A121C" strokeWidth="3" />
          <text x={x} y={y + 4} textAnchor="middle" fontSize="12" fontWeight="600" fill="#0F1B29">{i + 1}</text>
        </g>
      ))}
      {['A', 'B', 'C', 'D', 'E'].map((c, i) => <text key={c} x={i * 160 + 80} y="16" textAnchor="middle" fontSize="10" fill="#7389A0">{c}</text>)}
      <g transform="translate(560 506)" fill="none" stroke="#46627F">
        <rect width="224" height="40" />
        <text x="10" y="17" fontSize="10" letterSpacing="2" fill="#A3B4C6" stroke="none">PETA PASAR</text>
        <text x="10" y="32" fontSize="9" letterSpacing="2" fill="#7389A0" stroke="none">LEMBAR 02 · 5 LOKASI KASUS</text>
      </g>
    </svg>
  )
}
