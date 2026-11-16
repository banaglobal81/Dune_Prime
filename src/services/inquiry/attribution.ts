import type { InquiryAttribution } from "./types";

const STORAGE_KEY = "dp:first-touch";
const UTM_KEYS = ["source", "medium", "campaign", "term", "content"] as const;

type FirstTouch = Pick<InquiryAttribution, "referrer" | "utm">;

function readUtm(search: string): InquiryAttribution["utm"] {
  const params = new URLSearchParams(search);
  const utm: InquiryAttribution["utm"] = {};
  for (const key of UTM_KEYS) {
    const value = params.get(`utm_${key}`);
    if (value) utm[key] = value.slice(0, 200);
  }
  return utm;
}

/**
 * Remembers where the visitor came from on the first page of the visit, so an inquiry
 * sent from a later page still carries the original UTM source. Storage is optional:
 * if it is blocked, the current page's values are used.
 */
export function rememberFirstTouch(): void {
  try {
    if (sessionStorage.getItem(STORAGE_KEY)) return;
    const touch: FirstTouch = { referrer: document.referrer, utm: readUtm(location.search) };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(touch));
  } catch {
    // Storage unavailable (private mode, blocked cookies): nothing to remember.
  }
}

export function collectAttribution(): InquiryAttribution {
  let touch: FirstTouch | null = null;
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    touch = stored ? (JSON.parse(stored) as FirstTouch) : null;
  } catch {
    touch = null;
  }
  return {
    page: location.pathname,
    referrer: touch?.referrer ?? document.referrer,
    utm: touch?.utm ?? readUtm(location.search),
  };
}
