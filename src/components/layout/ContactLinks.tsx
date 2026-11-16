"use client";

import { siteConfig } from "@/config/site";
import { trackEvent } from "@/services/analytics";

type Channel = "email" | "whatsapp";

interface ContactValueProps {
  channel: Channel;
  /** Where on the page this link is, for analytics ("footer", "inquiry"). */
  location: string;
  className?: string;
}

function hrefFor(channel: Channel): string {
  const { email, whatsapp } = siteConfig.contact;
  return channel === "email" ? `mailto:${email}` : `https://wa.me/${whatsapp.replace(/\D/g, "")}`;
}

/**
 * Email or WhatsApp value from site config. While `contact.isDemo` is true the value
 * is shown as plain text, so visitors cannot reach an address we do not own.
 */
export function ContactValue({ channel, location, className }: ContactValueProps) {
  const { contact } = siteConfig;
  const label = channel === "email" ? contact.email : contact.whatsapp;
  if (!label) return null;
  if (contact.isDemo) return <span className={className}>{label}</span>;

  const external = channel === "whatsapp";
  return (
    <a
      className={className}
      href={hrefFor(channel)}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      onClick={
        external ? () => trackEvent({ name: "whatsapp_click", params: { location } }) : undefined
      }
    >
      {label}
    </a>
  );
}
