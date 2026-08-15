// bot/src/index.js
//
// Main entry point. Wires together config, database, Discord client,
// event handlers, and slash commands. Run with `npm start` or
// `npm run dev`.

import { readdirSync } from "node:fs";
import { Client, GatewayIntentBits, Collection, Partials } from "discord.js";
import { config } from "./core/config.js";
import { getLogger } from "./core/logger.js";
import { initDatabase, closeDatabase } from "./core/database.js";
import { loadQuestionBank } from "./modules/quiz-engine/loader.js";
import { loadCurriculumMapping } from "./modules/progress/curriculum.js";

const logger = getLogger("index");

async function main() {
  initDatabase();

  const questionBanksDir = new URL("../../quizzes/question-banks", import.meta.url);
  loadQuestionBank(questionBanksDir.pathname);

  const curriculumMappingFile = new URL("../../quizzes/schema/subject-class-mapping.json", import.meta.url);
  loadCurriculumMapping(curriculumMappingFile.pathname);

  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers, // privileged — must be enabled in the Discord Developer Portal
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent, // privileged — needed for anti-spam/anti-phishing message scanning
      GatewayIntentBits.AutoModerationExecution // needed for the autoModerationActionExecution event
    ],
    partials: [Partials.GuildMember, Partials.Channel]
  });

  client.commands = new Collection();

  const commandsDir = new URL("./commands/", import.meta.url);
  for (const file of readdirSync(commandsDir).filter((f) => f.endsWith(".js"))) {
    const mod = await import(new URL(file, commandsDir));
    if (mod.data && mod.execute) {
      client.commands.set(mod.data.name, mod);
    }
  }
  logger.info({ count: client.commands.size }, "Loaded slash commands");

  const eventsDir = new URL("./events/", import.meta.url);
  for (const file of readdirSync(eventsDir).filter((f) => f.endsWith(".js"))) {
    const mod = await import(new URL(file, eventsDir));
    if (!mod.name || !mod.execute) continue;
    if (mod.once) {
      client.once(mod.name, (...args) => mod.execute(...args));
    } else {
      client.on(mod.name, (...args) => mod.execute(...args));
    }
  }
  logger.info("Loaded event handlers");

  process.on("SIGINT", () => shutdown(client));
  process.on("SIGTERM", () => shutdown(client));
  process.on("unhandledRejection", (err) => logger.error({ err }, "Unhandled promise rejection"));

  await client.login(config.discord.token);
}

async function shutdown(client) {
  logger.info("Shutting down gracefully...");
  closeDatabase();
  client.destroy();
  process.exit(0);
}

main().catch((err) => {
  logger.error({ err }, "Fatal error during startup");
  process.exit(1);
});
