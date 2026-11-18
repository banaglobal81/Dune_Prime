import type { Locale } from "@/i18n/config";

/**
 * Country calling codes offered in the inquiry form: the markets Dune Prime talks to.
 * Visitors from elsewhere pick "Other" and type the full international number.
 */
export const DIALING_CODES = {
  AE: "+971",
  SA: "+966",
  QA: "+974",
  KW: "+965",
  BH: "+973",
  OM: "+968",
  KR: "+82",
  JP: "+81",
  CN: "+86",
  HK: "+852",
  TW: "+886",
  SG: "+65",
  TH: "+66",
  VN: "+84",
  MY: "+60",
  ID: "+62",
  PH: "+63",
  IN: "+91",
  PK: "+92",
  GB: "+44",
  IE: "+353",
  DE: "+49",
  FR: "+33",
  IT: "+39",
  ES: "+34",
  NL: "+31",
  CH: "+41",
  RU: "+7",
  KZ: "+7",
  TR: "+90",
  EG: "+20",
  LB: "+961",
  JO: "+962",
  US: "+1",
  CA: "+1",
  AU: "+61",
} as const;

export type DialingRegion = keyof typeof DIALING_CODES;

/** Select value for "Other": the visitor types the number with its own "+code". */
export const OTHER_REGION = "OTHER";

/** Pre-selected code per site language. */
export const DEFAULT_DIALING_REGION: Record<Locale, DialingRegion> = {
  en: "AE",
  ko: "KR",
  th: "TH",
};

export interface DialingOption {
  region: DialingRegion;
  code: string;
  label: string;
}

/**
 * Options with country names in the page language, sorted by name.
 * Built on the server so the browser hydrates the exact same text.
 */
export function dialingOptions(locale: Locale): DialingOption[] {
  const names = new Intl.DisplayNames([locale], { type: "region" });
  return (Object.keys(DIALING_CODES) as DialingRegion[])
    .map((region) => ({
      region,
      code: DIALING_CODES[region],
      label: `${names.of(region) ?? region} ${DIALING_CODES[region]}`,
    }))
    .sort((a, b) => a.label.localeCompare(b.label, locale));
}
