"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/Button";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { trackEvent } from "@/services/analytics";
import { rememberFirstTouch } from "@/services/inquiry/attribution";
import { createInquiryService } from "@/services/inquiry/InquiryService";
import {
  INQUIRER_TYPES,
  type InquirerType,
  type InquiryField,
  type InquiryFieldErrors,
  type InquiryInput,
} from "@/services/inquiry/types";
import styles from "./InquiryForm.module.css";

type Status = "idle" | "sending" | "sent" | "failed";

interface InquiryFormProps {
  locale: Locale;
  copy: Dictionary["inquiry"];
}

const FIELD_ORDER: InquiryField[] = ["name", "email", "consent"];

export function InquiryForm({ locale, copy }: InquiryFormProps) {
  const service = useMemo(() => createInquiryService(), []);
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<InquiryFieldErrors>({});
  const consentAt = useRef<string | null>(null);
  const thanksRef = useRef<HTMLParagraphElement>(null);
  const t = copy.form;

  useEffect(() => rememberFirstTouch(), []);
  useEffect(() => {
    if (status === "sent") thanksRef.current?.focus();
  }, [status]);

  const readInput = (form: HTMLFormElement): InquiryInput => {
    const data = new FormData(form);
    const value = (key: string) => String(data.get(key) ?? "");
    const type = value("type");
    return {
      name: value("name"),
      email: value("email"),
      type: (INQUIRER_TYPES as readonly string[]).includes(type) ? (type as InquirerType) : "other",
      timing: value("timing"),
      message: value("message"),
      consent: data.get("consent") === "on",
      company: value("company"),
    };
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const input = readInput(form);

    setStatus("sending");
    const result = await service.submit(input, {
      locale,
      consentAt: consentAt.current ?? new Date().toISOString(),
    });

    if (result.ok) {
      trackEvent({ name: "generate_lead", params: { inquirer_type: input.type, locale } });
      setErrors({});
      setStatus("sent");
      return;
    }
    if (result.reason === "invalid") {
      setErrors(result.errors);
      setStatus("idle");
      const first = FIELD_ORDER.find((field) => result.errors[field]);
      if (first) form.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    setStatus("failed");
  };

  const clearError = (field: InquiryField) => {
    if (!errors[field]) return;
    setErrors((previous) => {
      const next = { ...previous };
      delete next[field];
      return next;
    });
  };

  if (status === "sent") {
    return (
      <p ref={thanksRef} className={styles.thanks} role="status" tabIndex={-1}>
        <span className={styles.thanksTitle}>{copy.thanks.title}</span>{" "}
        <span className={styles.thanksBody}>{copy.thanks.body}</span>
      </p>
    );
  }

  const errorId = (field: InquiryField) => `inq-${field}-error`;
  const fieldProps = (field: InquiryField) => ({
    "aria-invalid": errors[field] ? true : undefined,
    "aria-describedby": errors[field] ? errorId(field) : undefined,
  });

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <div className={styles.field}>
        <label htmlFor="inq-name">{t.name}</label>
        <input
          id="inq-name"
          name="name"
          autoComplete="name"
          required
          maxLength={120}
          onInput={() => clearError("name")}
          {...fieldProps("name")}
        />
        {errors.name ? (
          <span id={errorId("name")} className={styles.error}>
            {t.errors.name}
          </span>
        ) : null}
      </div>

      <div className={styles.field}>
        <label htmlFor="inq-email">{t.email}</label>
        <input
          id="inq-email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          maxLength={200}
          onInput={() => clearError("email")}
          {...fieldProps("email")}
        />
        {errors.email ? (
          <span id={errorId("email")} className={styles.error}>
            {t.errors.email}
          </span>
        ) : null}
      </div>

      <div className={styles.field}>
        <label htmlFor="inq-type">{t.type}</label>
        <select id="inq-type" name="type" defaultValue="investor">
          {INQUIRER_TYPES.map((type) => (
            <option key={type} value={type}>
              {t.types[type]}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.field}>
        <label htmlFor="inq-timing">{t.timing}</label>
        <input id="inq-timing" name="timing" placeholder={t.timingPlaceholder} maxLength={120} />
      </div>

      <div className={`${styles.field} ${styles.full}`}>
        <label htmlFor="inq-message">{t.message}</label>
        <textarea
          id="inq-message"
          name="message"
          placeholder={t.messagePlaceholder}
          maxLength={4000}
        />
      </div>

      {/* Honeypot: hidden from people and assistive tech; bots tend to fill it. */}
      <div className={styles.honeypot} aria-hidden="true">
        <label htmlFor="inq-company">Company</label>
        <input id="inq-company" name="company" tabIndex={-1} autoComplete="off" />
      </div>

      <div className={styles.full}>
        <label className={styles.consent} htmlFor="inq-consent">
          <input
            id="inq-consent"
            name="consent"
            type="checkbox"
            required
            onChange={(event) => {
              consentAt.current = event.currentTarget.checked ? new Date().toISOString() : null;
              clearError("consent");
            }}
            {...fieldProps("consent")}
          />
          <span>{t.consent}</span>
        </label>
        {errors.consent ? (
          <span id={errorId("consent")} className={styles.error}>
            {t.errors.consent}
          </span>
        ) : null}
      </div>

      <div className={styles.full}>
        <Button
          type="submit"
          variant="outlineOnDark"
          className={styles.submit}
          disabled={status === "sending"}
        >
          {status === "sending" ? t.submitting : t.submit}
        </Button>
        <p className={styles.formError} role="alert">
          {status === "failed" ? t.errors.failed : null}
        </p>
      </div>
    </form>
  );
}
