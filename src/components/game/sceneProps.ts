import type { EntityKind } from '../../types'

export type MarkState = 'found' | 'saved' | 'ignored' | 'selected'

/** The contract every theme scene implements, so task components never depend on a specific world. */
export interface SceneProps {
  /** Entities to draw; omit for the scene's full default set. */
  entities?: EntityKind[]
  marks?: Partial<Record<EntityKind, MarkState>>
  /** Which entities show their Arabic label (after being found). */
  labeled?: EntityKind[]
  onSelect: (k: EntityKind) => void
  disabled?: boolean
  ariaLabelFor?: (k: EntityKind, i: number) => string
  hideBonus?: boolean
  /** Scene variant for themes with several environments (Market: shop, produce, …). */
  variant?: string
}
