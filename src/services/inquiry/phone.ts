import { DIALING_CODES, OTHER_REGION, type DialingRegion } from "@/content/dialing-codes";

const SEPARATORS = /[\s().-]/g;
/** E.164: "+", country code, subscriber number; 7 to 15 digits in total. */
const INTERNATIONAL = /^\+\d{7,15}$/;

/**
 * Joins the picked country code and the typed number, e.g. ("AE", "050 123 4567") →
 * "+971 501234567". A number typed with its own "+" is kept as typed. Empty input → "".
 */
export function formatPhone(region: string, number: string): string {
  const digits = number.replace(SEPARATORS, "");
  if (!digits) return "";
  const code = DIALING_CODES[region as DialingRegion];
  if (region === OTHER_REGION || !code || digits.startsWith("+")) return digits;
  // Drop the national trunk prefix (UAE "050" → "50"); Italian numbers keep their 0.
  const national = region === "IT" ? digits : digits.replace(/^0/, "");
  return `${code} ${national}`;
}

/** The field is optional: empty is valid, anything else must be a full international number. */
export function isValidPhone(phone: string): boolean {
  return phone === "" || INTERNATIONAL.test(phone.replace(" ", ""));
}
