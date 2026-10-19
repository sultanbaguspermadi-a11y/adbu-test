/**
 * Stable, namespaced case ids: `harbor-1…5`, `market-1…5`.
 * Saves made before the multi-theme update used `case-1…5` for Harbor; those ids still resolve everywhere
 * through `canonicalCaseId`, and persisted data is rewritten to the new ids on load (see services/persistence/schema.ts).
 * Pure module (no imports) so persistence, stores, cloud and the teacher view can all share it.
 */
export const LEGACY_CASE_IDS: Readonly<Record<string, string>> = {
  'case-1': 'harbor-1',
  'case-2': 'harbor-2',
  'case-3': 'harbor-3',
  'case-4': 'harbor-4',
  'case-5': 'harbor-5',
}

export function canonicalCaseId(id: string): string {
  return Object.prototype.hasOwnProperty.call(LEGACY_CASE_IDS, id) ? LEGACY_CASE_IDS[id] : id
}
