import type { NounGrammar, NumeralValue } from '../utils/numerals'

/** Narrative worlds. Adding a theme means extending this union, THEMES and THEME_VIEWS (the compiler enforces all three). */
export type ThemeId = 'harbor' | 'market'

export type HarborVocabId =
  | 'ship' | 'warehouse' | 'crane' | 'officer' | 'passengers' | 'captain'
  | 'waitingHall' | 'cargo' | 'container' | 'lifeboat' | 'buoy'
/** Drawable Market things (goods, people, fixtures); each has a glyph. */
export type MarketEntityKind =
  | 'book' | 'pen' | 'shirt' | 'watch' | 'apple' | 'card'
  | 'seller' | 'customer' | 'shop' | 'basket' | 'bag' | 'shelf' | 'scale' | 'package' | 'ledger' | 'receipt' | 'riyal' | 'tag'
/** Colour and size adjectives (taught for agreement; not drawn as entities). */
export type MarketAdjectiveId = 'red' | 'blue' | 'green' | 'yellow' | 'white' | 'black' | 'big' | 'small' | 'new'
export type MarketVocabId = MarketEntityKind | MarketAdjectiveId
/** Theme-owned nouns. */
export type VocabId = HarborVocabId | MarketVocabId

/** Shared grammar vocabulary: usable in every theme. */
export type PrepId = 'amama' | 'khalfa' | 'bijanib' | 'bayna' | 'fi' | 'qurba'
export type NumeralId = `num-${NumeralValue}`
export type SharedVocabId = PrepId | NumeralId

/** Any id a case, clue or task may list as vocabulary. */
export type LexiconId = VocabId | SharedVocabId

export type HarborEntityKind = HarborVocabId | 'clipboard'
export type EntityKind = HarborEntityKind | MarketEntityKind

export interface AdjectiveForms { m: string; f: string }
export interface VocabEntry<Id extends VocabId = VocabId> {
  id: Id; ar: string; idn: string; cue: string
  /** Counting grammar (gender, dual, plural genitive) for nouns that can be counted. */
  grammar?: NounGrammar
  /** Masculine / feminine indefinite nominative forms, for adjectives. */
  adj?: AdjectiveForms
}
/** A Market noun that can be counted: all grammar fields are present. */
export interface CountableEntry extends VocabEntry<MarketEntityKind> { grammar: Required<NounGrammar> }
export interface PrepEntry { id: PrepId; ar: string; idn: string }
export interface NumeralEntry { id: NumeralId; value: NumeralValue; ar: string; idn: string }

/** A piece of written Arabic evidence. */
export interface Clue {
  id: string
  ar: string
  /** Indonesian note, revealed only after the task that uses the clue is solved. */
  note: string
  entity?: EntityKind
  speaker?: EntityKind
  vocab: LexiconId[]
  /** Counts toward "evidence found". Distractors have isEvidence = false. */
  isEvidence: boolean
  /** Hidden bonus evidence (unlocks the "Sharp Eye" achievement). */
  hidden?: boolean
}

export interface Cell { col: number; row: number }
export interface MapDef {
  cols: number
  rows: number
  landmarks: { kind: EntityKind; col: number; row: number }[]
}
export interface SpatialConstraint {
  clueId: string
  subject: EntityKind
  rel: PrepId
  objects: EntityKind[]
}
export interface MiniMapOption {
  id: string
  map: MapDef
  placed: { kind: EntityKind; col: number; row: number }[]
}

interface TaskBase {
  id: string
  titleId: string
  instruction: string
  promptAr?: string
  /** Arabic sentence that Dalil explains by default for this task. */
  focusText?: string
  /** Vocabulary / preposition ids this task trains (used for analytics). */
  vocab: LexiconId[]
  /** Three scaffolded hint levels (general → specific → linguistic). Never the final answer. */
  hints: [string, string, string]
  /** Clue ids collected when the task is solved. */
  collects?: string[]
  /** Contextual feedback shown on success. */
  success: string
}

export interface HotspotTask extends TaskBase {
  type: 'hotspot'
  /** Scene variant to draw (themes with several scenes); defaults to the case scene. */
  scene?: string
  target: EntityKind
  clueId: string
  bonus?: { entity: EntityKind; clueId: string }
}
export interface SceneChoiceTask extends TaskBase {
  type: 'scene-choice'
  clueId: string
  options: MiniMapOption[]
  correct: string
  wrongNotes: Record<string, string>
}
export interface PlacementTask extends TaskBase {
  type: 'placement'
  map: MapDef
  movables: EntityKind[]
  constraints: SpatialConstraint[]
}
export interface DialogueTask extends TaskBase {
  type: 'dialogue'
  question: string
  statementIds: string[]
  relevant: string[]
  reasons: Record<string, string>
}
export interface AssignTask extends TaskBase {
  type: 'assign'
  items: EntityKind[]
  zones: { id: string; ar: string; entity: EntityKind }[]
  solution: Record<string, string>
  reasons: Record<string, string>
  referenceIds: string[]
}
export interface BoardTask extends TaskBase {
  type: 'board'
  phase: 'sort' | 'connect'
  cardIds: string[]
  relevant: string[]
  reasons: Record<string, string>
  validLinks?: [string, string][]
  requiredLinks?: [string, string][]
}
export interface EliminationTask extends TaskBase {
  type: 'elimination'
  question: string
  candidates: { id: string; ar: string; entity: EntityKind }[]
  answer: string
  eliminatedBy: Record<string, string[]>
  evidenceIds: string[]
  wrongHint: string
}
export interface SequenceTask extends TaskBase {
  type: 'sequence'
  eventIds: string[]
  order: string[]
  note: string
}
export interface InspectTask extends TaskBase {
  type: 'inspect'
  scene?: string
  entities: { entity: EntityKind; clueId?: string; relevant?: boolean; why?: string }[]
}
export interface ReportOption { id: string; ar: string; entity?: EntityKind; map?: MiniMapOption }
export interface ReportField {
  key: string
  labelAr: string
  labelId: string
  options: ReportOption[]
  correct: string
  wrongNote: Record<string, string>
}
export interface ReportTask extends TaskBase {
  type: 'report'
  fields: ReportField[]
  evidencePicker?: { validIds: string[]; min: number; invalidNote: string }
}

export type ItemColor = 'red' | 'blue' | 'green' | 'yellow' | 'white' | 'black'
export interface ItemSpec { entity: EntityKind; color?: ItemColor; size?: 'big' | 'small' }
/** What a ChoiceTask shows above its options. */
export type ChoiceVisual =
  | { kind: 'count'; entity: EntityKind; count: number }
  | { kind: 'price'; entity: EntityKind; price: number }
  | { kind: 'items'; items: ItemSpec[] }
export interface ChoiceOption { id: string; ar: string }
/** Pick the correct Arabic phrase/sentence for a picture. Options are normally generated by the grammar helpers, never hand-typed. */
export interface ChoiceTask extends TaskBase {
  type: 'choice'
  visual: ChoiceVisual
  /** Clue unlocked when solved. */
  clueId?: string
  options: ChoiceOption[]
  correct: string
  wrongNotes: Record<string, string>
}

export type Task =
  | ChoiceTask | HotspotTask | SceneChoiceTask | PlacementTask | DialogueTask | AssignTask
  | BoardTask | EliminationTask | SequenceTask | InspectTask | ReportTask

export interface CaseDefinition {
  id: string
  /** The narrative world this case belongs to. */
  theme: ThemeId
  /** 1-based ordinal WITHIN its theme (Harbor 1–5, Market 1–5); not a global sequence. */
  number: number
  /** Default scene variant for the theme's scene (e.g. 'shop', 'office'); omit for single-scene themes. */
  scene?: string
  titleAr: string
  titleId: string
  description: string
  story: string
  difficulty: number
  learningLevel: string
  mechanic: string
  objectives: string[]
  vocabulary: LexiconId[]
  showVocabMeaning: boolean
  clues: Clue[]
  tasks: Task[]
  solution: { summary: string; evidenceIds: string[] }
  reveal?: { lines: { ar: string; id: string }[]; conclusion: string }
}

/* ---------------- persistence / player data ---------------- */

export interface VocabStat { c: number; w: number }

export interface CaseResult {
  caseId: string
  at: number
  accuracy: number
  xp: number
  stars: number
  correct: number
  mistakes: number
  hints: number
  evidenceFound: number
  evidenceTotal: number
  timeMs: number
  vocab: Record<string, VocabStat>
  firstClear: boolean
}

export interface CaseProgress {
  caseId: string
  completed: boolean
  stars: number
  bestXp: number
  bestAccuracy: number
  bestTimeMs: number | null
  attempts: number
  lastPlayedAt: number
  lastResult: CaseResult | null
}

export interface PlayerProfile {
  id: string
  name: string
  className: string
  createdAt: number
  tutorialDone: boolean
  progress: Record<string, CaseProgress>
  vocabStats: Record<string, VocabStat>
  totals: { attempts: number; correct: number; mistakes: number; hints: number; timeMs: number }
  achievements: Record<string, number>
  results: CaseResult[]
}

/** Gameplay settings only. Appearance & accessibility live in theme/preferences.ts (preferencesStore). */
export interface Settings { demoUnlock: boolean }

export interface PersistedState {
  version: number
  activePlayerId: string | null
  players: Record<string, PlayerProfile>
  settings: Settings
}
