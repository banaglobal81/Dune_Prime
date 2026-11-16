import { serve } from "@hono/node-server";
import { getConnInfo } from "@hono/node-server/conninfo";

import { loadConfig } from "./config.js";
import { buildContainer, integrationNames } from "./container.js";
import { createApp } from "./http/app.js";

const config = loadConfig();
const container = buildContainer(config);
const { logger } = container;

const app = createApp({
  inquiries: container.inquiries,
  allowedOrigins: config.allowedOrigins,
  rateLimit: config.rateLimit,
  logger,
  integrations: integrationNames(container),
  remoteAddress: (c) => getConnInfo(c).remote.address,
});

const server = serve({ fetch: app.fetch, port: config.port, hostname: "0.0.0.0" }, (info) => {
  logger.info("Inquiry API listening", {
    port: info.port,
    origins: config.allowedOrigins,
    integrations: integrationNames(container),
  });
});

function shutdown(signal: string) {
  logger.info("Shutting down", { signal });
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10_000).unref();
}
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
