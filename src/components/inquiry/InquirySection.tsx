import { ContactValue } from "@/components/layout/ContactLinks";
import { Section } from "@/components/ui/Section";
import { siteConfig } from "@/config/site";
import { dialingOptions } from "@/content/dialing-codes";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { InquiryPanel } from "./InquiryPanel";
import styles from "./InquirySection.module.css";

/** "Let's talk": contact details on the left, inquiry form (and chat tab, when enabled) on the right. */
export function InquirySection({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const copy = dict.inquiry;
  const { contact, features } = siteConfig;

  return (
    <Section id="contact" tone="dark" aria-labelledby="contact-title">
      <h2 id="contact-title" className={styles.title} data-reveal>
        {copy.title}
      </h2>
      <div className={styles.layout} data-reveal>
        <div>
          <p className="lead">{copy.lead}</p>
          <dl className={styles.reach}>
            {contact.email ? (
              <div>
                <dt>{copy.emailLabel}</dt>
                <dd>
                  <ContactValue channel="email" location="inquiry" />
                </dd>
              </div>
            ) : null}
            {contact.whatsapp ? (
              <div>
                <dt>{copy.whatsappLabel}</dt>
                <dd>
                  <ContactValue channel="whatsapp" location="inquiry" />
                </dd>
              </div>
            ) : null}
          </dl>
          <p className={styles.hours}>{copy.hours}</p>
        </div>
        <InquiryPanel
          locale={locale}
          copy={copy}
          dialingOptions={dialingOptions(locale)}
          chatEnabled={features.chat}
        />
      </div>
    </Section>
  );
}
