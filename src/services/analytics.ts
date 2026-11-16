/**
 * Analytics events (GA4). A no-op until GA4 is installed with cookie consent
 * (Developer Handoff v4.4, Phase 1 · Trust). Call sites stay the same afterwards.
 */

type AnalyticsEvent =
  | { name: "generate_lead"; params: { inquirer_type: string; locale: string } }
  | { name: "whatsapp_click"; params: { location: string } };

declare global {
  interface Window {
    gtag?: (command: "event", name: string, params?: Record<string, unknown>) => void;
  }
}

export function trackEvent(event: AnalyticsEvent): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", event.name, event.params);
}
