// bot/src/core/config.js
//
// Loads and validates environment configuration. Only variables that
// truly cannot be discovered automatically (secrets, IDs Discord
// assigns before the bot can look anything up) are required here.
// Channel/role IDs are NOT required in .env — bootstrap-server.js and
// discord-sync.js populate those into the database automatically.

import "dotenv/config";

const REQUIRED_VARS = [
  "DISCORD_BOT_TOKEN",
  "DISCORD_CLIENT_ID",
  "DISCORD_GUILD_ID"
];

function loadConfig() {
  const missing = REQUIRED_VARS.filter((key) => !process.env[key] || process.env[key].trim() === "");

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variable(s): ${missing.join(", ")}. ` +
      `Copy bot/.env.example to bot/.env and fill these in before starting the bot.`
    );
  }

  return Object.freeze({
    discord: {
      token: process.env.DISCORD_BOT_TOKEN,
      clientId: process.env.DISCORD_CLIENT_ID,
      guildId: process.env.DISCORD_GUILD_ID
    },
    ownerDiscordId: process.env.OWNER_DISCORD_ID || null,
    database: {
      path: process.env.DATABASE_PATH || "./data/academy.db"
    },
    logLevel: process.env.LOG_LEVEL || "info",
    nodeEnv: process.env.NODE_ENV || "development",
    website: {
      baseUrl: process.env.WEBSITE_BASE_URL || null
    },
    aiHelper: {
      mode: process.env.AI_HELPER_MODE || "retrieval",
      externalApiKey: process.env.AI_HELPER_EXTERNAL_API_KEY || null
    },
    meeting: {
      day: process.env.WEEKLY_MEETING_DAY || "SUNDAY",
      hourIst: Number(process.env.WEEKLY_MEETING_HOUR_IST || 19)
    }
  });
}

export const config = loadConfig();
