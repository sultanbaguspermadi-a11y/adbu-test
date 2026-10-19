import { HARBOR_VOCAB, MARKET_VOCAB } from '../data/vocabulary'
import type { CaseDefinition, ThemeId, VocabEntry } from '../types'
import { pad2 } from '../utils/arabic'
import { HARBOR_SCENES, MARKET_SCENES } from './scenes'

/**
 * Pure theme metadata (no React), so the engine and `npm run verify` can use it without loading components.
 * Rendering pieces (scene, plate) live in ./views.tsx and are keyed by the same ThemeId.
 */
export interface ThemeDef {
  id: ThemeId
  titleAr: string
  titleId: string
  /** Label on file lists and headers, e.g. "PELABUHAN". */
  docLabel: string
  /** Letter in visual case codes: AD-H01, AD-M01. */
  codeLetter: string
  /** One-line description shown on the archive. */
  descriptionId: string
  /** Value of `data-district` on the wrapper: the stylesheet maps it to the district's accent and environment colours. */
  district: ThemeId
  /** Small decorative band used on the archive header: 'waves' (harbor) or 'awning' (market). */
  motif: 'waves' | 'awning'
  /** Scene variants this theme can draw; the first is the default. */
  scenes: readonly string[]
  /** Nouns this theme owns. Prepositions and numerals are shared and are not listed here. */
  vocab: readonly VocabEntry[]
  /** The first case of this theme opens once this case is completed; null = open from the start. */
  unlockAfterCaseId: string | null
}

export const THEMES = {
  harbor: {
    id: 'harbor', titleAr: 'الْمِينَاءُ', titleId: 'Pelabuhan', docLabel: 'PELABUHAN', codeLetter: 'H',
    descriptionId: 'Dermaga, kapal, gudang dan kontainer: baca keterangan saksi dan tentukan letak benda.',
    district: 'harbor', motif: 'waves', scenes: HARBOR_SCENES,
    vocab: HARBOR_VOCAB, unlockAfterCaseId: null,
  },
  market: {
    id: 'market', titleAr: 'التَّسَوُّقُ', titleId: 'Pasar', docLabel: 'PASAR', codeLetter: 'M',
    descriptionId: 'Toko, lapak dan buku catatan pedagang: hitung barang, bandingkan harga, cocokkan sifatnya.',
    district: 'market', motif: 'awning', scenes: MARKET_SCENES,
    vocab: MARKET_VOCAB, unlockAfterCaseId: 'harbor-2',
  },
} as const satisfies Record<ThemeId, ThemeDef>

/** Display order of themes in case lists. */
export const THEME_ORDER = ['harbor', 'market'] as const satisfies readonly ThemeId[]

export const getTheme = (id: ThemeId): ThemeDef => THEMES[id]

/** Visual case code with per-theme numbering, e.g. AD-H01 or AD-M03. */
export function caseCode(def: Pick<CaseDefinition, 'theme' | 'number'>): string {
  return `AD-${THEMES[def.theme].codeLetter}${pad2(def.number)}`
}
