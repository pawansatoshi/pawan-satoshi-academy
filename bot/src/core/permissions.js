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

/**
 * True if this Discord user ID is the configured server Owner.
 * The Owner check is deliberately independent of Discord roles —
 * it can never be revoked by a role change or bot bug.
 */
export function isOwner(discordUserId) {
  if (!config.ownerDiscordId) return false;
  return discordUserId === config.ownerDiscordId;
}

/**
 * Resolve the highest-ranked role key a guild member holds, based on
 * the role IDs stored in the database (populated by discord-sync.js).
 * Returns null if the member holds none of the mapped roles.
 */
export function getMemberRoleKey(member) {
  for (const roleKey of ROLE_RANK) {
    const roleId = getConfigValue(`role.${roleKey}`);
    if (roleId && member.roles.cache.has(roleId)) {
      return roleKey;
    }
  }
  return null;
}

/**
 * Check whether a member's highest role is at or above `minimumRoleKey`
 * in the hierarchy. Owner always passes regardless of roles.
 */
export function hasAtLeast(member, minimumRoleKey) {
  if (isOwner(member.id)) return true;

  const memberRank = ROLE_RANK.indexOf(getMemberRoleKey(member));
  const requiredRank = ROLE_RANK.indexOf(minimumRoleKey);

  if (memberRank === -1 || requiredRank === -1) return false;
  // Lower index = higher rank (Admin is index 0).
  return memberRank <= requiredRank;
}

export function isStaff(member) {
  if (isOwner(member.id)) return true;
  const roleKey = getMemberRoleKey(member);
  return STAFF_ROLE_KEYS.includes(roleKey);
}

/**
 * True if `actorMember` outranks `targetMember` enough to take a
 * moderation action against them. The Owner can always moderate
 * anyone (except themselves). Staff can never moderate someone at or
 * above their own rank — this prevents e.g. a Moderator timing out an
 * Admin.
 */
export function canModerate(actorMember, targetMember) {
  if (actorMember.id === targetMember.id) return false;
  if (isOwner(actorMember.id)) return true;
  if (isOwner(targetMember.id)) return false;

  const actorRank = ROLE_RANK.indexOf(getMemberRoleKey(actorMember));
  const targetRank = ROLE_RANK.indexOf(getMemberRoleKey(targetMember));

  if (actorRank === -1) return false; // actor has no staff role at all
  if (targetRank === -1) return true; // target is a regular member — any staff can moderate

  return actorRank < targetRank; // lower index = higher rank
}

/**
 * Guard for slash-command / interaction handlers. Replies ephemerally
 * and returns false if the member doesn't meet the requirement, so
 * callers can simply `if (!(await requireAtLeast(interaction, "admin"))) return;`
 */
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

/**
 * Safety check used by the bootstrap script and at bot startup: throws
 * if a permission set includes Administrator, unless explicitly
 * overridden with a documented reason (never used by default anywhere
 * in this codebase).
 */
export function assertNoAdministrator(permissionNames, context = "unknown") {
  if (permissionNames.includes("Administrator")) {
    throw new Error(
      `Refusing to apply Administrator permission (context: ${context}). ` +
      `This violates the project's least-privilege policy. If this is truly ` +
      `unavoidable, it must be a deliberate, documented exception — not a default.`
    );
  }
}

/**
 * Build a discord.js PermissionsBitField from an array of permission
 * flag names, validating each name exists and that Administrator is
 * never silently included.
 */
export function buildPermissions(permissionNames, context = "unknown") {
  assertNoAdministrator(permissionNames, context);

  const invalid = permissionNames.filter((name) => !(name in PermissionsBitField.Flags));
  if (invalid.length > 0) {
    throw new Error(`Unknown permission flag(s) in ${context}: ${invalid.join(", ")}`);
  }

  return new PermissionsBitField(permissionNames.map((name) => PermissionsBitField.Flags[name]));
}

/**
 * Check the bot's own permissions in the guild against the recommended
 * set, warning (not crashing) about anything missing so the operator
 * gets a clear, actionable message instead of silent partial failure.
 */
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
