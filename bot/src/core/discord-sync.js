// bot/src/core/discord-sync.js
//
// Bridges the static server-map.js definition to the live guild's
// actual channel/role IDs, and keeps those IDs in the database config
// table so no module ever hardcodes a Discord snowflake ID. Runs on
// every bot startup and after bootstrap-server.js makes changes.

import { CATEGORY_DEFINITIONS, ROLE_DEFINITIONS } from "./server-map.js";
import { setConfig } from "./database.js";
import { getLogger } from "./logger.js";

const logger = getLogger("discord-sync");

/**
 * Walk the guild's current roles and channels, match them by name
 * against server-map.js, and persist "role.<key>" / "channel.<key>" /
 * "category.<key>" IDs into the config table.
 *
 * Returns a report of what was found vs. what's still missing (missing
 * items simply mean bootstrap-server.js hasn't been run with --confirm
 * yet, or the map was edited after the last bootstrap run).
 */
export async function syncServerIds(guild) {
  await guild.roles.fetch();
  await guild.channels.fetch();

  const report = { roles: { found: [], missing: [] }, channels: { found: [], missing: [] } };

  for (const roleDef of ROLE_DEFINITIONS) {
    const liveRole = guild.roles.cache.find(
      (r) => r.name.toLowerCase() === roleDef.name.toLowerCase()
    );
    if (liveRole) {
      setConfig(`role.${roleDef.key}`, liveRole.id);
      report.roles.found.push(roleDef.key);
    } else {
      report.roles.missing.push(roleDef.key);
    }
  }

  for (const categoryDef of CATEGORY_DEFINITIONS) {
    const liveCategory = guild.channels.cache.find(
      (c) => c.type === 4 /* GuildCategory */ && c.name === categoryDef.name
    );
    if (liveCategory) {
      setConfig(`category.${categoryDef.key}`, liveCategory.id);
    }

    for (const channelDef of categoryDef.channels) {
      const liveChannel = guild.channels.cache.find(
        (c) =>
          c.name === channelDef.name &&
          (!liveCategory || c.parentId === liveCategory.id)
      );
      if (liveChannel) {
        setConfig(`channel.${channelDef.key}`, liveChannel.id);
        report.channels.found.push(channelDef.key);
      } else {
        report.channels.missing.push(channelDef.key);
      }
    }
  }

  logger.info(
    {
      rolesFound: report.roles.found.length,
      rolesMissing: report.roles.missing.length,
      channelsFound: report.channels.found.length,
      channelsMissing: report.channels.missing.length
    },
    "Server ID sync complete"
  );

  if (report.roles.missing.length > 0 || report.channels.missing.length > 0) {
    logger.warn(
      { missingRoles: report.roles.missing, missingChannels: report.channels.missing },
      "Some roles/channels from server-map.js were not found on the live server. " +
      "Run `npm run bootstrap:server -- --confirm` to create them."
    );
  }

  return report;
}
