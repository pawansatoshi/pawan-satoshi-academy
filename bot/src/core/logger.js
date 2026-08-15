// bot/src/core/logger.js
//
// Structured logging via pino. One logger instance, child loggers per
// module so every log line is traceable to its source.

import pino from "pino";
import { config } from "./config.js";

const transport = config.nodeEnv === "development"
  ? {
      target: "pino-pretty",
      options: { colorize: true, translateTime: "SYS:standard", ignore: "pid,hostname" }
    }
  : undefined;

export const rootLogger = pino({
  level: config.logLevel,
  ...(transport ? { transport } : {})
});

/**
 * Create a child logger scoped to a specific module.
 * @param {string} moduleName
 */
export function getLogger(moduleName) {
  return rootLogger.child({ module: moduleName });
}
