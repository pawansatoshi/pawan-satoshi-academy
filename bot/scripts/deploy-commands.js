// bot/scripts/deploy-commands.js
//
// Registers all slash commands from src/commands/ with Discord for the
// configured guild. Run this after adding/changing a command:
//   npm run deploy:commands

import { readdirSync } from "node:fs";
import { REST, Routes } from "discord.js";
import { config } from "../src/core/config.js";
import { getLogger } from "../src/core/logger.js";

const logger = getLogger("deploy-commands");

async function main() {
  const commandsDir = new URL("../src/commands/", import.meta.url);
  const files = readdirSync(commandsDir).filter((f) => f.endsWith(".js"));

  const commandData = [];
  for (const file of files) {
    const mod = await import(new URL(file, commandsDir));
    if (mod.data) commandData.push(mod.data.toJSON());
  }

  const rest = new REST({ version: "10" }).setToken(config.discord.token);

  logger.info({ count: commandData.length }, "Registering slash commands for guild");

  await rest.put(
    Routes.applicationGuildCommands(config.discord.clientId, config.discord.guildId),
    { body: commandData }
  );

  logger.info("Slash commands registered successfully");
}

main().catch((err) => {
  logger.error({ err }, "Failed to deploy commands");
  process.exit(1);
});
