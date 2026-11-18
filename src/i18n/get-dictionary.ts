import "server-only";

import type { Locale } from "./config";
import { en, type Dictionary } from "./dictionaries/en";
import { ko } from "./dictionaries/ko";
import { th } from "./dictionaries/th";

const DICTIONARIES: Record<Locale, Dictionary> = { en, ko, th };

/** Returns the copy for a locale. Server-only: copy is rendered into static HTML at build time. */
export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale];
}

export type { Dictionary };
