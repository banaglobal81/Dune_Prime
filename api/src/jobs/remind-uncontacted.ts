/**
 * Scheduled job: re-alert owners about inquiries still "New" after REMINDER_AFTER_HOURS.
 * Railway: a second service from this folder with start command `npm run remind`
 * and a cron schedule (e.g. every hour: `0 * * * *`). The process exits when done.
 */
import { loadConfig } from "../config.js";
import { buildContainer } from "../container.js";

const container = buildContainer(loadConfig());

try {
  const { failed } = await container.reminders.run();
  process.exit(failed > 0 ? 1 : 0);
} catch (error) {
  container.logger.error("Reminder job crashed", {
    error: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
}
