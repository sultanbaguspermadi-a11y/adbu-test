import type { ArabicGender } from './numerals'

/** Adjective agreement for Market descriptions (colour, size). Pure grammar, nominative case. */
export interface AdjectiveForms { readonly m: string; readonly f: string }

/** Indefinite predicate/attribute form: قَمِيصٌ أَحْمَرُ، سَاعَةٌ حَمْرَاءُ، كِتَابٌ كَبِيرٌ، بِطَاقَةٌ كَبِيرَةٌ. */
export function adjectiveFor(adj: AdjectiveForms, nounGender: ArabicGender): string {
  return nounGender === 'f' ? adj.f : adj.m
}

/** Definite attribute (agrees in gender AND definiteness): الْقَمِيصُ الْأَحْمَرُ، السَّاعَةُ الْحَمْرَاءُ. */
export function definiteAdjective(adj: AdjectiveForms, nounGender: ArabicGender): string {
  const indefinite = adjectiveFor(adj, nounGender)
  return `الْ${indefinite.replace(/ٌ$/, 'ُ')}`
}

/** The agreement error a careless writer makes: the other gender's form. */
export function mismatchedAdjective(adj: AdjectiveForms, nounGender: ArabicGender): string {
  return nounGender === 'f' ? adj.m : adj.f
}
