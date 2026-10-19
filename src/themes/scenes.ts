/** Scene variants per theme (pure data). A case or task picks one by id; the first id is the theme default. */
export const HARBOR_SCENES = ['harbor'] as const
export const MARKET_SCENES = ['entrance', 'shop', 'produce', 'textile', 'storage', 'office'] as const
export type MarketSceneId = (typeof MARKET_SCENES)[number]
export const isMarketScene = (id: string | undefined): id is MarketSceneId => (MARKET_SCENES as readonly string[]).includes(id ?? '')

/** Market entities whose glyph is drawn in the colour given by an ItemSpec (so a "red shirt" is visibly red). */
export const TINTABLE_MARKET_ENTITIES = ['shirt', 'watch', 'bag', 'package', 'book', 'card', 'apple', 'basket'] as const
