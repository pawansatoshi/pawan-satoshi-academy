// bot/src/core/permissions.js
//
// Central authorization choke point. Every privileged action in the
// bot should check permissions through THIS module, not re-implement
// its own role checks — this is what makes "Owner always overrides"
// and "no Administrator" rules enforceable in one place.

import { PermissionsBitField } from "discord.js";
import { config } from "./config.js";
import { ROLE_DEFINITIONS, STAFF_ROLE_KEYS } from "./server-map.js";
import { getConfigValue } from "./database.js";
import { getLogger } from "./logger.js";

const logger = getLogger("permissions");

// Order matters: index 0 = highest rank (excluding Owner, which is
// account-level, not a role).
const ROLE_RANK = ROLE_DEFINITIONS.map((r) => r.key);

export function isOwner(discordUserId) {
  if (!config.ownerDiscordId) return false;
  return discordUserId === config.ownerDiscordId;
}

export function getMemberRoleKey(member) {
  for (const roleKey of ROLE_RANK) {
    const roleId = getConfigValue(`role.${roleKey}`);
    if (roleId && member.roles.cache.has(roleId)) {
      return roleKey;
    }
  }
  return null;
}

export function hasAtLeast(member, minimumRoleKey) {
  if (isOwner(member.id)) return true;

  const memberRank = ROLE_RANK.indexOf(getMemberRoleKey(member));
  const requiredRank = ROLE_RANK.indexOf(minimumRoleKey);

  if (memberRank === -1 || requiredRank === -1) return false;
  return memberRank <= requiredRank;
}

export function isStaff(member) {
  if (isOwner(member.id)) return true;
  const roleKey = getMemberRoleKey(member);
  return STAFF_ROLE_KEYS.includes(roleKey);
}

/**
 * True if actorMember is an actual staff member and outranks the
 * target sufficiently to moderate them. Non-staff community tiers
 * (OG, Active, Verified, Member) are never treated as moderators even
 * though they participate in the overall role-order array.
 */
export function canModerate(actorMember, targetMember) {
  if (actorMember.id === targetMember.id) return false;
  if (isOwner(actorMember.id)) return true;
  if (isOwner(targetMember.id)) return false;
  if (!isStaff(actorMember)) return false;

  const actorRank = ROLE_RANK.indexOf(getMemberRoleKey(actorMember));
  const targetRank = ROLE_RANK.indexOf(getMemberRoleKey(targetMember));

  if (actorRank === -1) return false;
  if (targetRank === -1) return true;

  return actorRank < targetRank;
}

export async function requireAtLeast(interaction, minimumRoleKey) {
  const member = interaction.member;
  if (!member || !hasAtLeast(member, minimumRoleKey)) {
    await interaction.reply({
      content: "You don't have permission to use this command.",
      ephemeral: true
    });
    return false;
  }
  return true;
}

export async function requireOwner(interaction) {
  if (!isOwner(interaction.user.id)) {
    await interaction.reply({
      content: "This action is restricted to the server Owner.",
      ephemeral: true
    });
    return false;
  }
  return true;
}

export function assertNoAdministrator(permissionNames, context = "unknown") {
  if (permissionNames.includes("Administrator")) {
    throw new Error(
      `Refusing to apply Administrator permission (context: ${context}). ` +
      `This violates the project's least-privilege policy. If this is truly ` +
      `unavoidable, it must be a deliberate, documented exception — not a default.`
    );
  }
}

export function buildPermissions(permissionNames, context = "unknown") {
  assertNoAdministrator(permissionNames, context);

  const invalid = permissionNames.filter((name) => !(name in PermissionsBitField.Flags));
  if (invalid.length > 0) {
    throw new Error(`Unknown permission flag(s) in ${context}: ${invalid.join(", ")}`);
  }

  return new PermissionsBitField(permissionNames.map((name) => PermissionsBitField.Flags[name]));
}

export function auditBotPermissions(guild, recommendedPermissionNames) {
  const botMember = guild.members.me;
  if (!botMember) {
    logger.warn("Could not resolve bot's own guild member to audit permissions.");
    return { missing: recommendedPermissionNames, hasAdministrator: false };
  }

  const hasAdministrator = botMember.permissions.has(PermissionsBitField.Flags.Administrator);
  if (hasAdministrator) {
    logger.warn(
      "Bot currently has the Administrator permission on this server. " +
      "This project's policy is least-privilege — consider removing Administrator " +
      "and granting only the specific permissions it needs."
    );
  }

  const missing = recommendedPermissionNames.filter(
    (name) => !botMember.permissions.has(PermissionsBitField.Flags[name])
  );

  if (missing.length > 0) {
    logger.warn({ missing }, "Bot is missing some recommended permissions. Some features may not work until these are granted via the bot's role.");
  }

  return { missing, hasAdministrator };
}
