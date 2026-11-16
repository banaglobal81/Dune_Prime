import type { Logger } from "../ports.js";

/** JSON-lines logger in production (Railway parses it), readable lines elsewhere. */
export class ConsoleLogger implements Logger {
  constructor(private readonly json: boolean) {}

  info(message: string, data?: Record<string, unknown>): void {
    this.write("info", message, data);
  }

  warn(message: string, data?: Record<string, unknown>): void {
    this.write("warn", message, data);
  }

  error(message: string, data?: Record<string, unknown>): void {
    this.write("error", message, data);
  }

  private write(level: "info" | "warn" | "error", message: string, data?: Record<string, unknown>) {
    const out = level === "error" ? console.error : level === "warn" ? console.warn : console.log;
    if (this.json) {
      out(JSON.stringify({ level, message, time: new Date().toISOString(), ...data }));
    } else {
      out(`[${level}] ${message}`, data ?? "");
    }
  }
}

/** Turns an unknown thrown value into a loggable message. */
export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
