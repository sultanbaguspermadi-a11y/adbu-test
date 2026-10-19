import type { MarketEntityKind } from '../../types'

/** Flat vector glyphs for the Market world (64×64 box, ground ≈ y 60), same visual language as the Harbor glyphs. */
const K = {
  dark: '#1F2A36', cream: '#F6EEDC', paper: '#EDE3C8', amber: '#F2B33D', red: '#C8453B', teal: '#2E8B9A', navy: '#1E3A5F',
  wood: '#B8844B', woodDark: '#6B4A27', kraft: '#C9A06A', skin: '#E8B98E', steel: '#6F8AA6', green: '#4F9D69', blue: '#3E7CB1',
}

export const MARKET_DEFAULT_TINT: Partial<Record<MarketEntityKind, string>> = {
  book: K.teal, shirt: K.blue, bag: K.amber, package: K.kraft, apple: K.red, card: K.navy, basket: K.wood,
}

export function MarketGlyph({ kind, tint }: { kind: MarketEntityKind; tint?: string }) {
  const c = tint ?? MARKET_DEFAULT_TINT[kind]
  switch (kind) {
    case 'book':
      return (
        <g>
          <rect x="9" y="38" width="46" height="14" rx="2" fill={K.navy} /><rect x="13" y="40" width="40" height="10" fill={K.cream} />
          <rect x="12" y="22" width="40" height="16" rx="2" fill={c} stroke={K.dark} strokeOpacity=".45" strokeWidth="1.2" /><rect x="16" y="24" width="34" height="12" fill={K.cream} opacity=".92" />
          <rect x="12" y="22" width="5" height="16" rx="2" fill={K.dark} opacity=".35" /><path d="M22 29h22M22 33h14" stroke={c} strokeWidth="2" />
        </g>
      )
    case 'pen':
      return (
        <g transform="rotate(-38 32 32)">
          <rect x="26" y="6" width="12" height="42" rx="3" fill={K.steel} /><rect x="26" y="6" width="12" height="9" rx="3" fill={K.red} />
          <rect x="35" y="8" width="2.4" height="20" fill={K.cream} opacity=".7" /><path d="M26 48 H38 L32 60 Z" fill={K.cream} /><path d="M30 55 H34 L32 60 Z" fill={K.dark} />
        </g>
      )
    case 'shirt':
      return (
        <g>
          <path d="M20 12 L8 20 L13 32 L19 29 V56 H45 V29 L51 32 L56 20 L44 12 L38 17 H26 Z" fill={c} stroke={K.dark} strokeOpacity=".45" strokeWidth="1.4" strokeLinejoin="round" />
          <path d="M26 12 L32 24 L38 12 L38 17 H26 Z" fill={K.cream} stroke={K.dark} strokeOpacity=".3" strokeWidth="1" />
          {[30, 38, 46].map((y) => <circle key={y} cx="32" cy={y} r="1.8" fill={K.cream} stroke={K.dark} strokeOpacity=".4" strokeWidth=".8" />)}
          <path d="M19 29 V56 H45 V29" fill="none" stroke={K.dark} strokeWidth="1" opacity=".18" />
        </g>
      )
    case 'watch':
      return (
        <g>
          <rect x="24" y="4" width="16" height="20" rx="3" fill={c ?? K.dark} stroke={K.dark} strokeOpacity=".55" strokeWidth="1.4" /><rect x="24" y="40" width="16" height="20" rx="3" fill={c ?? K.dark} stroke={K.dark} strokeOpacity=".55" strokeWidth="1.4" />
          <circle cx="32" cy="32" r="15" fill={K.amber} /><circle cx="32" cy="32" r="12" fill={K.cream} />
          <path d="M32 32 V24 M32 32 L38 35" stroke={K.dark} strokeWidth="2.4" strokeLinecap="round" />
          {[0, 90, 180, 270].map((a) => <rect key={a} x="31.2" y="21" width="1.6" height="2.6" fill={K.dark} transform={`rotate(${a} 32 32)`} />)}
        </g>
      )
    case 'apple':
      return (
        <g>
          <path d="M32 20 C22 12 8 20 10 36 C12 50 22 58 32 54 C42 58 52 50 54 36 C56 20 42 12 32 20 Z" fill={c} />
          <path d="M18 28 q3-7 9-7" stroke="#fff" strokeWidth="2.4" fill="none" opacity=".4" strokeLinecap="round" />
          <path d="M32 20 C32 14 33 10 36 7" stroke={K.woodDark} strokeWidth="2.6" fill="none" strokeLinecap="round" />
          <path d="M36 12 C42 6 50 8 50 8 C50 8 48 16 40 16 Z" fill={K.green} />
        </g>
      )
    case 'card':
      return (
        <g>
          <rect x="6" y="14" width="52" height="34" rx="4" fill={c} stroke={K.dark} strokeOpacity=".45" strokeWidth="1.4" /><rect x="6" y="22" width="52" height="7" fill={K.dark} opacity=".55" />
          <rect x="12" y="35" width="12" height="8" rx="1.5" fill={K.amber} /><path d="M30 38h22M30 43h14" stroke={K.cream} strokeWidth="2" opacity=".7" />
        </g>
      )
    case 'bag':
      return (
        <g>
          <path d="M22 22 C22 8 42 8 42 22" fill="none" stroke={K.dark} strokeWidth="2.6" opacity=".65" />
          <path d="M12 22 H52 L48 58 H16 Z" fill={c} stroke={K.dark} strokeOpacity=".45" strokeWidth="1.4" strokeLinejoin="round" /><path d="M12 22 H52 L51.4 28 H12.6 Z" fill={K.dark} opacity=".18" />
          <rect x="24" y="34" width="16" height="10" rx="2" fill={K.cream} opacity=".9" /><circle cx="32" cy="39" r="2.6" fill={K.red} />
        </g>
      )
    case 'basket':
      return (
        <g>
          <path d="M14 26 C14 6 50 6 50 26" fill="none" stroke={K.woodDark} strokeWidth="3.4" />
          <path d="M8 26 H56 L50 56 H14 Z" fill={c} />
          {[34, 42, 50].map((y) => <path key={y} d={`M10 ${y - 8} H54`} stroke={K.woodDark} strokeWidth="1.6" opacity=".6" />)}
          {[18, 26, 34, 42, 50].map((x) => <path key={x} d={`M${x} 26 L${x - 1.5} 56`} stroke={K.woodDark} strokeWidth="1.4" opacity=".5" />)}
        </g>
      )
    case 'package':
      return (
        <g>
          <path d="M8 24 L32 14 L56 24 V54 L32 60 L8 54 Z" fill={c} /><path d="M8 24 L32 34 L56 24" fill="none" stroke={K.woodDark} strokeWidth="1.6" opacity=".6" />
          <path d="M32 34 V60" stroke={K.woodDark} strokeWidth="1.6" opacity=".6" /><path d="M24 18 L48 28 V34 L24 24 Z" fill={K.cream} opacity=".85" />
          <rect x="38" y="42" width="12" height="8" fill={K.cream} /><path d="M40 45h8M40 48h5" stroke={K.dark} strokeWidth="1.2" />
        </g>
      )
    case 'shelf':
      return (
        <g>
          <rect x="6" y="6" width="4" height="54" fill={K.woodDark} /><rect x="54" y="6" width="4" height="54" fill={K.woodDark} />
          {[22, 42, 58].map((y) => <rect key={y} x="6" y={y} width="52" height="3.5" fill={K.wood} />)}
          <rect x="14" y="10" width="9" height="12" fill={K.teal} /><rect x="25" y="13" width="8" height="9" fill={K.red} /><circle cx="44" cy="17" r="5" fill={K.amber} />
          <rect x="12" y="29" width="14" height="13" fill={K.cream} /><rect x="30" y="31" width="9" height="11" fill={K.blue} /><rect x="42" y="27" width="10" height="15" fill={K.green} />
        </g>
      )
    case 'seller':
      return (
        <g>
          <path d="M14 60 V38 Q14 28 32 28 Q50 28 50 38 V60 Z" fill={K.teal} /><path d="M22 34 H42 V60 H22 Z" fill={K.cream} opacity=".92" />
          <circle cx="32" cy="18" r="9" fill={K.skin} /><path d="M22 15 Q32 3 42 15 Z" fill={K.dark} /><rect x="22" y="14" width="20" height="3" fill={K.red} />
          <circle cx="29" cy="19" r="1.2" fill={K.dark} /><circle cx="35" cy="19" r="1.2" fill={K.dark} />
        </g>
      )
    case 'customer':
      return (
        <g>
          <path d="M12 60 V38 Q12 28 30 28 Q48 28 48 38 V60 Z" fill={K.red} /><circle cx="30" cy="18" r="9" fill={K.skin} />
          <path d="M21 16 Q30 6 39 16 Q30 11 21 16 Z" fill={K.woodDark} /><circle cx="27" cy="19" r="1.2" fill={K.dark} /><circle cx="33" cy="19" r="1.2" fill={K.dark} />
          <path d="M44 40 H58 L56 58 H46 Z" fill={K.amber} /><path d="M48 40 C48 34 54 34 54 40" fill="none" stroke={K.dark} strokeWidth="1.6" />
        </g>
      )
    case 'shop':
      return (
        <g>
          <rect x="6" y="26" width="52" height="34" fill={K.paper} /><rect x="6" y="26" width="52" height="3" fill={K.dark} opacity=".2" />
          <path d="M3 14 H61 L58 28 H6 Z" fill={K.cream} />{[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M${3 + i * 11.6} 14 h5.8 l-1 14 h-5.2 z`} fill={K.red} transform={`translate(${i * 0} 0)`} />)}
          <rect x="12" y="34" width="18" height="14" fill={K.blue} opacity=".85" /><rect x="38" y="36" width="12" height="24" fill={K.woodDark} /><circle cx="47" cy="48" r="1.3" fill={K.amber} />
        </g>
      )
    case 'scale':
      return (
        <g>
          <rect x="22" y="54" width="20" height="6" rx="2" fill={K.woodDark} /><rect x="30" y="16" width="4" height="40" fill={K.steel} />
          <path d="M8 18 H56" stroke={K.steel} strokeWidth="3.4" strokeLinecap="round" /><circle cx="32" cy="14" r="4" fill={K.amber} />
          <path d="M10 19 L4 38 H20 Z M54 19 L48 38 H64 Z" fill="none" stroke={K.steel} strokeWidth="1.4" />
          <path d="M3 38 Q12 48 21 38 Z M47 38 Q56 48 65 38 Z" fill={K.amber} />
        </g>
      )
    case 'ledger':
      return (
        <g>
          <rect x="8" y="8" width="48" height="50" rx="3" fill={K.red} /><rect x="14" y="8" width="42" height="50" rx="2" fill={K.cream} />
          <rect x="8" y="8" width="7" height="50" rx="3" fill={K.dark} opacity=".5" />
          {[18, 25, 32, 39, 46].map((y) => <path key={y} d={`M20 ${y} H50`} stroke={K.steel} strokeWidth="1.4" />)}<path d="M33 12 V54" stroke={K.red} strokeWidth="1.4" opacity=".7" />
        </g>
      )
    case 'receipt':
      return (
        <g>
          <path d="M14 6 H50 V58 L45 54 L40 58 L35 54 L30 58 L25 54 L20 58 L14 54 Z" fill={K.cream} stroke={K.steel} strokeWidth="1" />
          {[14, 21, 28, 35].map((y) => <path key={y} d={`M20 ${y} H44`} stroke={K.steel} strokeWidth="1.8" />)}<path d="M20 44 H34" stroke={K.red} strokeWidth="2.4" />
        </g>
      )
    case 'riyal':
      return (
        <g>
          <circle cx="32" cy="34" r="22" fill={K.amber} /><circle cx="32" cy="34" r="17" fill="none" stroke={K.woodDark} strokeWidth="1.8" opacity=".65" />
          <path d="M26 34 a7 7 0 1 0 8-7 a5.4 5.4 0 1 1-8 7 Z" fill={K.woodDark} opacity=".7" /><path d="M16 22 q6-8 16-9" stroke="#fff" strokeWidth="2.4" fill="none" opacity=".5" strokeLinecap="round" />
        </g>
      )
    case 'tag':
      return (
        <g transform="rotate(-12 32 32)">
          <path d="M10 14 H44 L58 32 L44 50 H10 Z" fill={K.amber} /><circle cx="19" cy="32" r="3.6" fill={K.dark} opacity=".75" />
          <path d="M19 32 C10 22 10 8 24 6" fill="none" stroke={K.dark} strokeWidth="1.4" opacity=".6" />
          <rect x="26" y="25" width="18" height="12" rx="1.5" fill={K.cream} /><path d="M29 29h12M29 33h8" stroke={K.dark} strokeWidth="1.6" />
        </g>
      )
  }
}
