// bot/src/modules/roles/index.js
//
// Owns all Discord role *assignment* actions (not creation — that's
// bootstrap-server.js's job). Reads role IDs from the database, which
// discord-sync.js keeps populated from server-map.js.

import { getConfigValue, upsertMember, logAudit } from "../../core/database.js";
import { getLogger } from "../../core/logger.js";

const logger = getLogger("roles");

/**
 * Assign the base "Member" role to a newly-joined member. This is the
 * only role granted automatically pre-verification.
 */
export async function assignDefaultRole(member) {
  const memberRoleId = getConfigValue("role.member");
  if (!memberRoleId) {
    logger.warn("role.member is not set in config — run bootstrap-server.js first.");
    return false;
  }

  if (member.roles.cache.has(memberRoleId)) return true;

  try {
    await member.roles.add(memberRoleId, "Automatic: default role on join");
    upsertMember(member.id, { username: member.user.username });
    logAudit("role_assigned", "bot", member.id, { role: "member" });
    logger.info({ memberId: member.id }, "Assigned default Member role");
    return true;
  } catch (err) {
    logger.error({ err, memberId: member.id }, "Failed to assign default Member role");
    return false;
  }
}

/**
 * Assign the "Verified" role after a member completes verification.
 */
export async function assignVerifiedRole(member) {
  const verifiedRoleId = getConfigValue("role.verified");
  if (!verifiedRoleId) {
    logger.warn("role.verified is not set in config — run bootstrap-server.js first.");
    return false;
  }

  if (member.roles.cache.has(verifiedRoleId)) return true;

  try {
    await member.roles.add(verifiedRoleId, "Verification completed");
    logAudit("role_assigned", "bot", member.id, { role: "verified" });
    logger.info({ memberId: member.id }, "Assigned Verified role");
    return true;
  } catch (err) {
    logger.error({ err, memberId: member.id }, "Failed to assign Verified role");
    return false;
  }
}

export function hasRole(member, roleKey) {
  const roleId = getConfigValue(`role.${roleKey}`);
  return roleId ? member.roles.cache.has(roleId) : false;
}
