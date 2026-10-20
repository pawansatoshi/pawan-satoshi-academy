// bot/scripts/cleanup-server.js
//
// One-time cleanup for the Pawan Satoshi Academy Discord bootstrap.
// Deletes only the exact categories/channels/roles declared by the
// academy server map. Preserves uncategorized #general and General voice,
// the @everyone role, members, and unrelated channels/roles.
//
// Run manually once with: npm run cleanup:server
// Do NOT make this the normal start command.

import { Client, GatewayIntentBits, ChannelType } from "discord.js";
import { config } from "../src/core/config.js";
import { getLogger } from "../src/core/logger.js";
import { ROLE_DEFINITIONS, CATEGORY_DEFINITIONS } from "../src/core/server-map.js";

const logger = getLogger("cleanup-server");
const CONFIRM = process.argv.includes("--confirm");

async function main() {
  if (!CONFIRM) {
    console.log("DRY RUN only. Review the targets below. To delete them, rerun with --confirm.");
  }

  const client = new Client({ intents: [GatewayIntentBits.Guilds] });
  try {
    await client.login(config.discord.token);
    await new Promise((resolve) => client.once("ready", resolve));
    const guild = await client.guilds.fetch(config.discord.guildId);
    await guild.channels.fetch();
    await guild.roles.fetch();

    const academyCategoryNames = new Set(CATEGORY_DEFINITIONS.map((c) => c.name));
    const academyChannelNames = new Set(CATEGORY_DEFINITIONS.flatMap((c) => c.channels.map((ch) => ch.name)));
    const academyRoleNames = new Set(ROLE_DEFINITIONS.map((r) => r.name.toLowerCase()));

    // Delete mapped academy channels only when they are inside one of our
    // exact academy categories. Preserve legacy/default channels outside them.
    const categories = guild.channels.cache.filter(
      (ch) => ch.type === ChannelType.GuildCategory && academyCategoryNames.has(ch.name)
    );
    const categoryIds = new Set(categories.map((ch) => ch.id));

    const channels = guild.channels.cache.filter((ch) =>
      ch.parentId && categoryIds.has(ch.parentId) && academyChannelNames.has(ch.name)
    );

    console.log(`Academy categories: ${categories.size}`);
    console.log(`Mapped channels inside those categories: ${channels.size}`);
    console.log(`Academy roles by exact name: ${guild.roles.cache.filter((r) => academyRoleNames.has(r.name.toLowerCase()) && !r.managed).size}`);
    console.log("Preserving uncategorized #general / General voice, @everyone, members, and unrelated resources.");

    if (!CONFIRM) return;

    // Delete child channels first, then empty academy categories.
    for (const channel of channels.values()) {
      await channel.delete("One-time cleanup: remove Academy-created channel structure");
      logger.info({ channel: channel.name }, "Deleted Academy channel");
    }
    for (const category of categories.values()) {
      // Only delete after the mapped child channels have been removed;
      // skip if any unrelated channel remains in this category.
      const remaining = guild.channels.cache.filter((ch) => ch.parentId === category.id && !channels.has(ch.id));
      if (remaining.size > 0) {
        logger.warn({ category: category.name, remaining: remaining.map((ch) => ch.name) }, "Preserving category with unrelated channels");
        continue;
      }
      await category.delete("One-time cleanup: remove empty Academy-created category");
      logger.info({ category: category.name }, "Deleted Academy category");
    }

    // Remove only exact-name, unmanaged Academy roles. Never delete @everyone
    // or managed integration/bot roles. Discord hierarchy may still block this.
    await guild.roles.fetch();
    for (const role of guild.roles.cache.values()) {
      if (!role.managed && role.id !== guild.roles.everyone.id && academyRoleNames.has(role.name.toLowerCase())) {
        await role.delete("One-time cleanup: remove Academy-created role");
        logger.info({ role: role.name }, "Deleted Academy role");
      }
    }
    console.log("Cleanup finished.");
  } finally {
    client.destroy();
  }
}

main().catch((err) => {
  logger.error({ err }, "Cleanup failed");
  process.exit(1);
});
