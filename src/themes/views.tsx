import type { ComponentType } from 'react'
import { HarborPlate } from '../components/game/HarborPlate'
import { HarborScene } from '../components/game/HarborScene'
import { MarketPlate } from '../components/game/MarketPlate'
import { MarketScene } from '../components/game/MarketScene'
import type { SceneProps } from '../components/game/sceneProps'
import type { ThemeId } from '../types'

/** The React side of a theme. Kept apart from THEMES so the engine and verify script never import components. */
export interface ThemeView {
  Scene: ComponentType<SceneProps>
  /** Decorative survey plate (aria-hidden). */
  Plate: ComponentType<{ className?: string }>
}

export const THEME_VIEWS = {
  harbor: { Scene: HarborScene, Plate: HarborPlate },
  market: { Scene: MarketScene, Plate: MarketPlate },
} as const satisfies Record<ThemeId, ThemeView>

export const themeView = (id: ThemeId): ThemeView => THEME_VIEWS[id]
