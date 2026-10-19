import { motion } from 'framer-motion'
import { useMotion } from '../../theme/useAppearance'

const PINS: [number, number][] = [[150, 232], [338, 342], [470, 452], [612, 246], [698, 338]]
const ROUTE = 'M150 232 C 230 300, 280 336, 338 342 S 440 420, 470 452 S 590 330, 612 246 S 690 300, 698 338'

/** Survey plate of the port. Pure illustration (aria-hidden): grid refs, quay, sheds, container yard, vessel and the five case locations. */
export function HarborPlate({ className = '' }: { className?: string }) {
  const cols = ['A', 'B', 'C', 'D', 'E']
  const { decorative } = useMotion() // the route draw-in is decoration, not state
  return (
    <svg viewBox="0 0 800 560" className={className} aria-hidden role="presentation" fontFamily="'IBM Plex Mono', ui-monospace, monospace">
      <defs>
        <pattern id="hp-water" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
          <line x1="0" y1="0" x2="0" y2="14" stroke="#5F7F9F" strokeOpacity=".28" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="800" height="560" fill="#0A121C" />
      {Array.from({ length: 19 }).map((_, i) => <line key={`v${i}`} x1={i * 40 + 40} y1="0" x2={i * 40 + 40} y2="560" stroke="#A3B4C6" strokeOpacity={(i + 1) % 4 === 0 ? 0.16 : 0.06} />)}
      {Array.from({ length: 13 }).map((_, i) => <line key={`h${i}`} x1="0" y1={i * 40 + 40} x2="800" y2={i * 40 + 40} stroke="#A3B4C6" strokeOpacity={(i + 1) % 4 === 0 ? 0.16 : 0.06} />)}
      {/* water + quay */}
      <rect x="0" y="372" width="800" height="188" fill="url(#hp-water)" />
      <rect x="0" y="352" width="800" height="22" fill="#16263A" stroke="#46627F" />
      <text x="16" y="367" fontSize="10" letterSpacing="3" fill="#7389A0">DERMAGA</text>
      {/* sheds */}
      {[[56, 168, 176, 122, 'GUDANG A'], [262, 168, 150, 122, 'GUDANG B']].map(([x, y, w, h, t]) => (
        <g key={String(t)}>
          <rect x={x as number} y={y as number} width={w as number} height={h as number} fill="#16263A" stroke="#A3B4C6" strokeOpacity=".7" />
          <line x1={x as number} y1={(y as number) + 18} x2={(x as number) + (w as number)} y2={(y as number) + 18} stroke="#A3B4C6" strokeOpacity=".35" />
          <text x={(x as number) + 10} y={(y as number) + 13} fontSize="10" letterSpacing="2" fill="#A3B4C6">{t}</text>
        </g>
      ))}
      {/* container yard */}
      {Array.from({ length: 4 }).flatMap((_, r) => Array.from({ length: 6 }).map((__, c) => {
        const hot = r === 1 && c === 3
        return <rect key={`${r}-${c}`} x={480 + c * 34} y={190 + r * 24} width="30" height="20" fill={hot ? '#B8452A' : (r + c) % 2 ? '#2C4560' : '#1E3249'} stroke={hot ? '#E0745F' : '#46627F'} />
      }))}
      <text x="480" y="182" fontSize="10" letterSpacing="2" fill="#A3B4C6">LAPANGAN PETI KEMAS</text>
      {/* vessel */}
      <path d="M130 420 H530 L575 462 L500 512 H170 Z" fill="#16263A" stroke="#A3B4C6" strokeOpacity=".8" />
      <path d="M170 440 H500 M170 466 H520 M170 490 H480" stroke="#A3B4C6" strokeOpacity=".25" />
      <rect x="196" y="428" width="64" height="26" fill="#1E3249" stroke="#A3B4C6" strokeOpacity=".5" />
      <text x="290" y="448" fontSize="10" letterSpacing="3" fill="#A3B4C6">KAPAL</text>
      {/* route + case pins */}
      <motion.path d={ROUTE} fill="none" stroke="#E3B04B" strokeWidth="2" strokeDasharray="7 6" initial={decorative ? { pathLength: 0 } : false} animate={{ pathLength: 1 }} transition={{ duration: 1.6, ease: 'easeInOut' }} />
      {PINS.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="13" fill="#E3B04B" stroke="#0A121C" strokeWidth="3" />
          <text x={x} y={y + 4} textAnchor="middle" fontSize="12" fontWeight="600" fill="#0F1B29">{i + 1}</text>
        </g>
      ))}
      {/* grid references + compass + title block */}
      {cols.map((c, i) => <text key={c} x={i * 160 + 80} y="16" textAnchor="middle" fontSize="10" fill="#7389A0">{c}</text>)}
      {[1, 2, 3].map((n, i) => <text key={n} x="8" y={i * 160 + 90} fontSize="10" fill="#7389A0">{n}</text>)}
      <g transform="translate(748 58)" stroke="#A3B4C6" strokeOpacity=".8" fill="none">
        <circle r="22" /><path d="M0 -22 L5 0 L0 22 L-5 0 Z" fill="#A3B4C6" fillOpacity=".25" />
        <text y="-28" textAnchor="middle" fontSize="11" fill="#A3B4C6" stroke="none">N</text>
      </g>
      <g transform="translate(560 506)" fill="none" stroke="#46627F">
        <rect width="224" height="40" />
        <text x="10" y="17" fontSize="10" letterSpacing="2" fill="#A3B4C6" stroke="none">PETA PELABUHAN</text>
        <text x="10" y="32" fontSize="9" letterSpacing="2" fill="#7389A0" stroke="none">LEMBAR 01 · 5 LOKASI KASUS</text>
      </g>
    </svg>
  )
}
