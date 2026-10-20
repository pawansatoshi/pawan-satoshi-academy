// bot/scripts/cleanup-server.js
// One-time removal of Academy bootstrap resources. Keeps the two original
// channels that bootstrap remapped: #general and General voice.

import { Client, GatewayIntentBits, ChannelType } from "discord.js";
import { config } from "../src/core/config.js";
import { getLogger } from "../src/core/logger.js";
import { ROLE_DEFINITIONS, CATEGORY_DEFINITIONS } from "../src/core/server-map.js";

const logger = getLogger("cleanup-server");
const CONFIRM = process.argv.includes("--confirm");

async function main() {
  if (!CONFIRM) console.log("DRY RUN only. Add --confirm to execute cleanup.");
  const client = new Client({ intents: [GatewayIntentBits.Guilds] });
  try {
    await client.login(config.discord.token);
    if (!client.isReady()) await new Promise((resolve) => client.once("ready", resolve));
    const guild = await client.guilds.fetch(config.discord.guildId);
    await guild.channels.fetch();
    await guild.roles.fetch();

    const categoryNames = new Set(CATEGORY_DEFINITIONS.map((c) => c.name));
    const channelNames = new Set(CATEGORY_DEFINITIONS.flatMap((c) => c.channels.map((ch) => ch.name)));
    const roleNames = new Set(ROLE_DEFINITIONS.map((r) => r.name.toLowerCase()));
    const categories = guild.channels.cache.filter((ch) => ch.type === ChannelType.GuildCategory && categoryNames.has(ch.name));
    const categoryIds = new Set(categories.map((ch) => ch.id));

    // These two names are the exact remap targets from server-map.js.
    // Restore them before deleting Academy categories; never delete them.
    const restoreText = guild.channels.cache.find((ch) =>
      ch.type === ChannelType.GuildText && ch.name === "general-chat" && ch.parentId && categoryIds.has(ch.parentId)
    );
    const restoreVoice = guild.channels.cache.find((ch) =>
      ch.type === ChannelType.GuildVoice && ch.name === "community-lounge" && ch.parentId && categoryIds.has(ch.parentId)
    );

    const channels = guild.channels.cache.filter((ch) =>
      ch.parentId && categoryIds.has(ch.parentId) && channelNames.has(ch.name) &&
      ch.id !== restoreText?.id && ch.id !== restoreVoice?.id
    );

    console.log("Mode:", CONFIRM ? "EXECUTE" : "DRY RUN");
    console.log("Academy categories:", categories.size);
    console.log("Academy channels to delete:", channels.size);
    console.log("Academy roles by exact name:", guild.roles.cache.filter((r) => roleNames.has(r.name.toLowerCase()) && !r.managed).size);
    console.log("Original #general remap found:", Boolean(restoreText));
    console.log("Original General voice remap found:", Boolean(restoreVoice));
    console.log("Members and unrelated resources will be preserved.");
    if (!CONFIRM) return;

    for (const channel of [restoreText, restoreVoice].filter(Boolean)) {
      const restoredName = channel.id === restoreText?.id ? "general" : "General";
      await channel.setParent(null, { lockPermissions: false, reason: "Restore original default Discord channel before Academy cleanup" });
      await channel.setName(restoredName, "Restore original default Discord channel before Academy cleanup");
      logger.info({ channelId: channel.id, restoredName }, "Restored original channel");
    }

    for (const channel of channels.values()) {
      await channel.delete("One-time cleanup: remove Academy-created channel structure");
      logger.info({ channel: channel.name }, "Deleted Academy channel");
    }

    for (const category of categories.values()) {
      const remaining = guild.channels.cache.filter((ch) => ch.parentId === category.id && !channels.has(ch.id));
      if (remaining.size > 0) {
        logger.warn({ category: category.name, remaining: remaining.map((ch) => ch.name) }, "Preserving category containing unrecognized channels");
        continue;
      }
      await category.delete("One-time cleanup: remove empty Academy-created category");
      logger.info({ category: category.name }, "Deleted Academy category");
    }

    await guild.roles.fetch();
    for (const role of guild.roles.cache.values()) {
      if (!role.managed && role.id !== guild.roles.everyone.id && roleNames.has(role.name.toLowerCase())) {
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
