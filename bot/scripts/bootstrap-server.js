// bot/scripts/bootstrap-server.js
//
// Rebuilds the live Discord server to match server-map.js.
//
//   npm run bootstrap:server              → dry run only, changes nothing
//   npm run bootstrap:server -- --confirm → applies the changes
//
// Rules this script hard-enforces, no matter what:
//   - NEVER deletes a channel, category, or role
//   - NEVER renames/touches the 5 pre-existing third-party bot roles
//   - NEVER requests/grants the Administrator permission
//   - Only creates what's missing, renames/moves what's mapped,
//     leaves everything else untouched

import { Client, GatewayIntentBits, ChannelType, PermissionsBitField } from "discord.js";
import { config } from "../src/core/config.js";
import { getLogger } from "../src/core/logger.js";
import { initDatabase, setConfig } from "../src/core/database.js";
import {
  SERVER_NAME,
  ROLE_DEFINITIONS,
  CATEGORY_DEFINITIONS,
  LEGACY_CHANNEL_REMAPS,
  STAFF_ROLE_KEYS,
  BOT_RECOMMENDED_PERMISSIONS
} from "../src/core/server-map.js";
import { buildPermissions, assertNoAdministrator } from "../src/core/permissions.js";

const logger = getLogger("bootstrap-server");
const CONFIRM = process.argv.includes("--confirm");

const CHANNEL_TYPE_MAP = {
  category: ChannelType.GuildCategory,
  text: ChannelType.GuildText,
  forum: ChannelType.GuildForum,
  voice: ChannelType.GuildVoice
};

async function main() {
  assertNoAdministrator(BOT_RECOMMENDED_PERMISSIONS, "bootstrap-server invite permissions");
  initDatabase();

  const client = new Client({ intents: [GatewayIntentBits.Guilds] });
  await client.login(config.discord.token);
  await new Promise((resolve) => client.once("ready", resolve));

  const guild = await client.guilds.fetch(config.discord.guildId).catch(() => null);
  if (!guild) {
    throw new Error(
      `Could not find guild ${config.discord.guildId}. Confirm DISCORD_GUILD_ID in .env ` +
      `and that the bot has already been invited to this server.`
    );
  }
  await guild.roles.fetch();
  await guild.channels.fetch();
  await guild.members.fetchMe();

  logger.info({ guildName: guild.name, guildId: guild.id }, "Connected to guild — computing plan");

  const plan = computePlan(guild);
  printPlan(plan, guild);

  if (!CONFIRM) {
    logger.info("Dry run complete. No changes were made. Re-run with `--confirm` to apply.");
    await client.destroy();
    return;
  }

  logger.info("--confirm passed — applying changes now");
  await applyPlan(plan, guild);

  logger.info("Bootstrap complete. Persisting resolved IDs to database...");
  await persistIds(guild);

  logger.info("Done. Run the bot normally with `npm start` — it will pick up all IDs automatically.");
  await client.destroy();
}

function computePlan(guild) {
  const plan = {
    renameServer: guild.name !== SERVER_NAME ? { from: guild.name, to: SERVER_NAME } : null,
    rolesToCreate: [],
    rolesExisting: [],
    categoriesToCreate: [],
    categoriesExisting: [],
    channelsToCreate: [],
    channelsExisting: [],
    legacyRemaps: []
  };

  for (const roleDef of ROLE_DEFINITIONS) {
    const existing = guild.roles.cache.find((r) => r.name.toLowerCase() === roleDef.name.toLowerCase());
    if (existing) {
      plan.rolesExisting.push({ key: roleDef.key, name: roleDef.name, id: existing.id });
    } else {
      plan.rolesToCreate.push(roleDef);
    }
  }

  for (const categoryDef of CATEGORY_DEFINITIONS) {
    const existingCategory = guild.channels.cache.find(
      (c) => c.type === ChannelType.GuildCategory && c.name === categoryDef.name
    );
    if (existingCategory) {
      plan.categoriesExisting.push({ key: categoryDef.key, name: categoryDef.name, id: existingCategory.id });
    } else {
      plan.categoriesToCreate.push(categoryDef);
    }

    for (const channelDef of categoryDef.channels) {
      const remap = LEGACY_CHANNEL_REMAPS.find(
        (r) => r.newCategoryKey === categoryDef.key && r.newChannelKey === channelDef.key
      );

      if (remap) {
        const legacyChannel = guild.channels.cache.find(
          (c) => c.name.toLowerCase() === remap.currentName.toLowerCase() && c.parentId === null
        );
        if (legacyChannel) {
          plan.legacyRemaps.push({
            channelId: legacyChannel.id,
            fromName: legacyChannel.name,
            toName: channelDef.name,
            toCategoryKey: categoryDef.key
          });
          continue;
        }
      }

      const existingChannel = guild.channels.cache.find((c) => c.name === channelDef.name);
      if (existingChannel) {
        plan.channelsExisting.push({ key: channelDef.key, name: channelDef.name, id: existingChannel.id });
      } else {
        plan.channelsToCreate.push({ ...channelDef, categoryKey: categoryDef.key, categoryName: categoryDef.name });
      }
    }
  }

  return plan;
}

function printPlan(plan) {
  const lines = [];
  lines.push("");
  lines.push("═══════════════════════════════════════════════════");
  lines.push("  BOOTSTRAP DRY RUN — Pawan Satoshi Academy");
  lines.push("═══════════════════════════════════════════════════");
  lines.push(`\nSERVER RENAME: ${plan.renameServer ? `"${plan.renameServer.from}" → "${plan.renameServer.to}"` : "no change needed"}`);
  lines.push(`\nROLES — create ${plan.rolesToCreate.length}, already exist ${plan.rolesExisting.length}`);
  plan.rolesToCreate.forEach((r) => lines.push(`  [CREATE] ${r.name}`));
  plan.rolesExisting.forEach((r) => lines.push(`  [SKIP]   ${r.name} (already exists)`));
  lines.push(`\nCATEGORIES — create ${plan.categoriesToCreate.length}, already exist ${plan.categoriesExisting.length}`);
  plan.categoriesToCreate.forEach((c) => lines.push(`  [CREATE] ${c.name}`));
  plan.categoriesExisting.forEach((c) => lines.push(`  [SKIP]   ${c.name} (already exists)`));
  lines.push(`\nCHANNELS — create ${plan.channelsToCreate.length}, already exist ${plan.channelsExisting.length}, remap ${plan.legacyRemaps.length}`);
  plan.channelsToCreate.forEach((c) => lines.push(`  [CREATE] #${c.name} (in ${c.categoryName})`));
  plan.legacyRemaps.forEach((r) => lines.push(`  [RENAME+MOVE] #${r.fromName} → #${r.toName} (into ${r.toCategoryKey})`));
  plan.channelsExisting.forEach((c) => lines.push(`  [SKIP]   #${c.name} (already exists)`));
  lines.push("\nNothing will be deleted. Nothing outside this list is touched.");
  lines.push(`\nMode: ${CONFIRM ? "APPLYING CHANGES" : "DRY RUN (no changes made)"}`);
  lines.push("═══════════════════════════════════════════════════\n");
  // eslint-disable-next-line no-console
  console.log(lines.join("\n"));
}

async function applyPlan(plan, guild) {
  if (plan.renameServer) {
    await guild.setName(SERVER_NAME, "Bootstrap: rebrand to Pawan Satoshi Academy");
    logger.info({ to: SERVER_NAME }, "Server renamed");
  }

  for (const roleDef of plan.rolesToCreate) {
    const permissions = buildPermissions(roleDef.permissions, `role:${roleDef.key}`);
    await guild.roles.create({
      name: roleDef.name,
      color: roleDef.color,
      hoist: roleDef.hoist,
      mentionable: roleDef.mentionable,
      permissions,
      reason: "Bootstrap: create Academy role hierarchy"
    });
    logger.info({ role: roleDef.name }, "Role created");
  }

  // Refresh role state after creation. Discord bot roles are managed
  // roles and cannot be moved. Academy roles MUST remain below the
  // bot's highest role so the bot can assign Verified/Member and
  // manage the staff hierarchy safely.
  await guild.roles.fetch();
  await reorderOwnedRoles(guild);

  const createdCategoryIds = {};
  for (const categoryDef of plan.categoriesToCreate) {
    const overwrites = buildCategoryOverwrites(guild, categoryDef.visibility);
    const category = await guild.channels.create({
      name: categoryDef.name,
      type: ChannelType.GuildCategory,
      permissionOverwrites: overwrites,
      reason: "Bootstrap: create Academy category structure"
    });
    createdCategoryIds[categoryDef.key] = category.id;
    logger.info({ category: categoryDef.name }, "Category created");
  }

  const allCategoryIds = { ...createdCategoryIds };
  guild.channels.cache
    .filter((c) => c.type === ChannelType.GuildCategory)
    .forEach((c) => {
      const match = CATEGORY_DEFINITIONS.find((def) => def.name === c.name);
      if (match) allCategoryIds[match.key] = c.id;
    });

  for (const channelDef of plan.channelsToCreate) {
    const parentId = allCategoryIds[channelDef.categoryKey];
    await guild.channels.create({
      name: channelDef.name,
      type: CHANNEL_TYPE_MAP[channelDef.type],
      parent: parentId || null,
      reason: "Bootstrap: create Academy channel structure"
    });
    logger.info({ channel: channelDef.name }, "Channel created");
  }

  for (const remap of plan.legacyRemaps) {
    const channel = await guild.channels.fetch(remap.channelId);
    const parentId = allCategoryIds[remap.toCategoryKey];
    await channel.edit({
      name: remap.toName,
      parent: parentId || null,
      reason: "Bootstrap: rename/move pre-existing channel into new structure"
    });
    logger.info({ from: remap.fromName, to: remap.toName }, "Legacy channel renamed and moved");
  }
}

async function reorderOwnedRoles(guild) {
  await guild.roles.fetch();
  const botMember = guild.members.me || await guild.members.fetchMe();
  const botHighestPosition = botMember.roles.highest.position;
  const ourRoleNames = ROLE_DEFINITIONS.map((r) => r.name.toLowerCase());
  const ourRoles = guild.roles.cache.filter((r) => ourRoleNames.includes(r.name.toLowerCase()) && !r.managed);

  // Put Academy roles immediately below the bot's highest role. Never
  // attempt to move an Academy role above the bot's managed role.
  const orderedByRank = [...ROLE_DEFINITIONS];
  const maxAssignablePosition = Math.max(1, botHighestPosition - 1);
  const startPosition = Math.max(1, maxAssignablePosition - orderedByRank.length + 1);

  const positions = orderedByRank
    .map((def, idx) => {
      const role = ourRoles.find((r) => r.name.toLowerCase() === def.name.toLowerCase());
      return role ? { role: role.id, position: startPosition + (orderedByRank.length - 1 - idx) } : null;
    })
    .filter(Boolean);

  if (positions.length > 0) {
    await guild.roles.setPositions(positions).catch((err) => {
      logger.warn({ err }, "Could not fully reorder Academy roles. Ensure the bot's highest role is above the Academy roles in Discord.");
    });
  }
}

function buildCategoryOverwrites(guild, visibility) {
  const everyoneId = guild.roles.everyone.id;

  if (visibility === "public") {
    return [{ id: everyoneId, allow: [PermissionsBitField.Flags.ViewChannel] }];
  }

  if (visibility === "verified") {
    const verifiedRole = guild.roles.cache.find((r) => r.name.toLowerCase() === "verified");
    const overwrites = [{ id: everyoneId, deny: [PermissionsBitField.Flags.ViewChannel] }];
    if (verifiedRole) {
      overwrites.push({ id: verifiedRole.id, allow: [PermissionsBitField.Flags.ViewChannel] });
    }
    return overwrites;
  }

  if (visibility === "staff") {
    const overwrites = [{ id: everyoneId, deny: [PermissionsBitField.Flags.ViewChannel] }];
    for (const roleKey of STAFF_ROLE_KEYS) {
      const def = ROLE_DEFINITIONS.find((r) => r.key === roleKey);
      const liveRole = def && guild.roles.cache.find((r) => r.name.toLowerCase() === def.name.toLowerCase());
      if (liveRole) {
        overwrites.push({ id: liveRole.id, allow: [PermissionsBitField.Flags.ViewChannel] });
      }
    }
    return overwrites;
  }

  return [];
}

async function persistIds(guild) {
  await guild.roles.fetch();
  await guild.channels.fetch();

  for (const roleDef of ROLE_DEFINITIONS) {
    const role = guild.roles.cache.find((r) => r.name.toLowerCase() === roleDef.name.toLowerCase());
    if (role) setConfig(`role.${roleDef.key}`, role.id);
  }

  for (const categoryDef of CATEGORY_DEFINITIONS) {
    const category = guild.channels.cache.find(
      (c) => c.type === ChannelType.GuildCategory && c.name === categoryDef.name
    );
    if (category) setConfig(`category.${categoryDef.key}`, category.id);

    for (const channelDef of categoryDef.channels) {
      const channel = guild.channels.cache.find(
        (c) => c.name === channelDef.name && (!category || c.parentId === category.id)
      );
      if (channel) setConfig(`channel.${channelDef.key}`, channel.id);
    }
  }
}

main().catch((err) => {
  logger.error({ err }, "Bootstrap failed");
  process.exit(1);
});
