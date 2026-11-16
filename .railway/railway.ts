/**
 * Railway infrastructure for Dune Prime (Infrastructure as Code).
 *
 *   railway config plan    # preview changes
 *   railway config apply   # apply them to the linked Railway project
 *
 * Railway reads this file only when you run plan/apply, not during deploys.
 * Anything not declared here is removed on apply, so secrets are declared with
 * preserve(): set their values in the Railway dashboard (api service → Variables)
 * and apply keeps them.
 */
import { defineRailway, github, preserve, project, service } from "railway/iac";

const REPO = "banaglobal81/Dune_Prime";
const BRANCH = "main";

/** API secrets and integration settings, set in the dashboard on the api service. */
const API_SECRET_NAMES = [
  "GOOGLE_SHEET_ID",
  "GOOGLE_SERVICE_ACCOUNT_EMAIL",
  "GOOGLE_PRIVATE_KEY",
  "RESEND_API_KEY",
  "MAIL_REPLY_TO",
  "TEAM_ALERT_EMAILS",
  "TEAM_ALERT_WHATSAPP",
  "INQUIRY_OWNERS",
  "WHATSAPP_TOKEN",
  "WHATSAPP_PHONE_NUMBER_ID",
  "TURNSTILE_SECRET_KEY",
] as const;

export default defineRailway(() => {
  // Inquiry API: validates, stores in Google Sheets, sends the auto-reply and team alerts.
  const api = service("api", {
    source: github(REPO, { branch: BRANCH, rootDirectory: "/api" }),
    build: { buildCommand: "npm run build", watchPatterns: ["/api/**"] },
    deploy: {
      startCommand: "npm start",
      healthcheckPath: "/health",
      restartPolicyType: "ON_FAILURE",
    },
    env: {
      NODE_ENV: "production",
      MAIL_FROM: "Dune Prime <hello@dunepr.com>",
      // The website's custom domain, the bare domain, and its Railway test domain.
      // (website.RAILWAY_PUBLIC_DOMAIN resolves to the custom domain, so the test domain is listed.)
      ALLOWED_ORIGINS: [
        "https://www.dunepr.com",
        "https://dunepr.com",
        "https://website-production-65abd3ff.up.railway.app",
      ].join(","),
      ...Object.fromEntries(API_SECRET_NAMES.map((name) => [name, preserve()])),
    },
  });

  // Hourly job: re-alert owners about inquiries still "New" after 24 hours.
  const reminder = service("reminder", {
    source: github(REPO, { branch: BRANCH, rootDirectory: "/api" }),
    build: { buildCommand: "npm run build", watchPatterns: ["/api/**"] },
    deploy: {
      startCommand: "npm run remind",
      cronSchedule: "0 * * * *",
      restartPolicyType: "NEVER",
    },
    env: {
      NODE_ENV: "production",
      MAIL_FROM: "Dune Prime <hello@dunepr.com>",
      // Same integrations as the API, referenced so they are set only once.
      ...Object.fromEntries(API_SECRET_NAMES.map((name) => [name, `\${{api.${name}}}`])),
    },
  });

  // Website: static Next.js export served by `serve`.
  const website = service("website", {
    source: github(REPO, { branch: BRANCH }),
    build: {
      buildCommand: "npm run build",
      watchPatterns: [
        "/src/**",
        "/public/**",
        "/assets/**",
        "/scripts/**",
        "/package.json",
        "/package-lock.json",
        "/next.config.ts",
        "/tsconfig.json",
      ],
    },
    deploy: {
      startCommand: "npm start",
      healthcheckPath: "/",
      restartPolicyType: "ON_FAILURE",
    },
    // Custom domain dunepr.com is added in the Railway dashboard (not supported in this file).
    env: {
      // Baked into the static HTML at build time: redeploy the website after changing them.
      NEXT_PUBLIC_SITE_URL: "https://dunepr.com",
      NEXT_PUBLIC_FORM_ENDPOINT: "https://${{api.RAILWAY_PUBLIC_DOMAIN}}/inquiries",
      NEXT_PUBLIC_TURNSTILE_SITE_KEY: preserve(),
    },
  });

  return project("dune-prime", { resources: [website, api, reminder] });
});
