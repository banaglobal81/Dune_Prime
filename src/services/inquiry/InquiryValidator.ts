import type { InquiryFieldErrors, InquiryInput } from "./types";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Validates form input. Returns the fields that need attention; empty object means valid. */
export class InquiryValidator {
  validate(input: InquiryInput): InquiryFieldErrors {
    const errors: InquiryFieldErrors = {};
    if (!input.name.trim()) errors.name = true;
    if (!EMAIL_PATTERN.test(input.email.trim())) errors.email = true;
    if (!input.consent) errors.consent = true;
    return errors;
  }

  isValid(errors: InquiryFieldErrors): boolean {
    return Object.keys(errors).length === 0;
  }
}
