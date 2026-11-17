import type { PhotoKey } from "./photos";

/**
 * Homes shown in the carousel (and on the portfolio page once enabled).
 * Copy for each entry lives in the dictionary under `home.homes[copyKey]`.
 * Phase 2: this list moves to the CMS.
 */
export type HomeEntry =
  | { id: string; kind: "listing"; photo: PhotoKey; copyKey: "unit" | "villa" }
  | { id: string; kind: "invite"; photo: PhotoKey; copyKey: "nextHome" };

export const HOMES: ReadonlyArray<HomeEntry> = [
  { id: "first-villa", kind: "listing", photo: "villa2", copyKey: "villa" },
  { id: "capital-bay-603", kind: "listing", photo: "unit", copyKey: "unit" },
  { id: "next-home", kind: "invite", photo: "next", copyKey: "nextHome" },
];

/** Homes listed on the portfolio page (invites excluded). */
export const LISTED_HOMES = HOMES.filter(
  (home): home is Extract<HomeEntry, { kind: "listing" }> => home.kind === "listing",
);
