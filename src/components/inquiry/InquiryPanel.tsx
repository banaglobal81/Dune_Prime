"use client";

import { useId, useState } from "react";

import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { ChatSlot } from "./ChatSlot";
import { InquiryForm } from "./InquiryForm";
import styles from "./InquiryPanel.module.css";

type Tab = "form" | "chat";

interface InquiryPanelProps {
  locale: Locale;
  copy: Dictionary["inquiry"];
  chatEnabled: boolean;
}

/** Inquiry form, with an optional "Chat with us" tab (features.chat). */
export function InquiryPanel({ locale, copy, chatEnabled }: InquiryPanelProps) {
  const [tab, setTab] = useState<Tab>("form");
  const baseId = useId();

  if (!chatEnabled) return <InquiryForm locale={locale} copy={copy} />;

  const tabs: Tab[] = ["form", "chat"];
  return (
    <div>
      <div className={styles.tabs} role="tablist">
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            id={`${baseId}-tab-${t}`}
            aria-selected={tab === t}
            aria-controls={`${baseId}-panel-${t}`}
            className={styles.tab}
            onClick={() => setTab(t)}
          >
            {copy.tabs[t]}
          </button>
        ))}
      </div>
      <div
        role="tabpanel"
        id={`${baseId}-panel-form`}
        aria-labelledby={`${baseId}-tab-form`}
        hidden={tab !== "form"}
      >
        <InquiryForm locale={locale} copy={copy} />
      </div>
      <div
        role="tabpanel"
        id={`${baseId}-panel-chat`}
        aria-labelledby={`${baseId}-tab-chat`}
        hidden={tab !== "chat"}
      >
        <ChatSlot intro={copy.chatIntro} />
      </div>
    </div>
  );
}
