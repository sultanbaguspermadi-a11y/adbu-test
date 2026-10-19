import type { ChoiceVisual as Visual, ItemColor } from '../../types'
import { EntityGlyph } from './EntityIcon'

export const ITEM_COLORS: Record<ItemColor, string> = {
  red: '#C8453B', blue: '#2F6DB5', green: '#3E9B5E', yellow: '#E7B83C', white: '#F1ECE0', black: '#2B2F36',
}

/** The picture a ChoiceTask asks about: N items to count, an item with a digit price tag, or items with colour/size. */
export function ChoiceVisual({ visual }: { visual: Visual }) {
  if (visual.kind === 'count') {
    const per = visual.count > 5 ? Math.ceil(visual.count / 2) : visual.count
    return (
      <div className="flex flex-wrap items-end justify-center gap-x-2 gap-y-1 py-2" role="img" aria-label={`${visual.count} benda`} style={{ maxWidth: per * 84 }}>
        {Array.from({ length: visual.count }, (_, i) => <EntityGlyph key={i} kind={visual.entity} size={72} className="max-w-[17vw]" />)}
      </div>
    )
  }
  if (visual.kind === 'price') {
    return (
      <div className="flex items-end justify-center gap-5 py-2" role="img" aria-label={`Harga ${visual.price} riyal`}>
        <EntityGlyph kind={visual.entity} size={96} />
        <div className="flex items-center gap-2 rounded-sm border-2 border-ink-900 bg-ink-900 px-3 py-1.5">
          <span className="font-mono text-3xl font-semibold tabular-nums text-gold-400">{visual.price}</span>
          <EntityGlyph kind="riyal" size={34} />
        </div>
      </div>
    )
  }
  return (
    <div className="flex flex-wrap items-end justify-center gap-6 py-2" role="img" aria-label="Barang yang dibandingkan">
      {visual.items.map((it, i) => (
        <EntityGlyph key={i} kind={it.entity} size={it.size === 'small' ? 58 : 96} tint={it.color ? ITEM_COLORS[it.color] : undefined} />
      ))}
    </div>
  )
}
