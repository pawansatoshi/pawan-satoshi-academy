// bot/tests/permissions.test.js
//
// Tests the hard safety guarantees in core/permissions.js: that
// Administrator can never sneak into a role or bot permission set,
// and that role hierarchy comparisons behave correctly. Requires a
// .env with at least dummy required vars — see note below.

import { test } from "node:test";
import assert from "node:assert/strict";

// core/config.js validates required env vars at import time, so tests
// set safe dummy values before importing anything that chains into it.
process.env.DISCORD_BOT_TOKEN ??= "test-token";
process.env.DISCORD_CLIENT_ID ??= "test-client-id";
process.env.DISCORD_GUILD_ID ??= "test-guild-id";
process.env.OWNER_DISCORD_ID ??= "owner-123";
process.env.DATABASE_PATH ??= ":memory:";
process.env.NODE_ENV = "test";

const { assertNoAdministrator, buildPermissions, isOwner, canModerate } = await import("../src/core/permissions.js");
const { ROLE_DEFINITIONS, BOT_RECOMMENDED_PERMISSIONS } = await import("../src/core/server-map.js");

test("assertNoAdministrator throws when Administrator is present", () => {
  assert.throws(() => assertNoAdministrator(["ManageGuild", "Administrator"], "test"));
});

test("assertNoAdministrator does not throw for a safe permission set", () => {
  assert.doesNotThrow(() => assertNoAdministrator(["ManageGuild", "ManageChannels"], "test"));
});

test("buildPermissions rejects an unknown permission flag name", () => {
  assert.throws(() => buildPermissions(["NotARealPermission"], "test"));
});

test("buildPermissions succeeds for a valid, safe permission list", () => {
  const bitfield = buildPermissions(["ManageMessages", "KickMembers"], "test");
  assert.ok(bitfield.has("ManageMessages"));
  assert.ok(bitfield.has("KickMembers"));
});

test("isOwner returns true only for the configured Owner Discord ID", () => {
  assert.equal(isOwner("owner-123"), true);
  assert.equal(isOwner("someone-else"), false);
});

test("no role in server-map.js requests Administrator", () => {
  for (const role of ROLE_DEFINITIONS) {
    assert.doesNotThrow(
      () => assertNoAdministrator(role.permissions, `role:${role.key}`),
      `Role "${role.key}" must never include Administrator`
    );
  }
});

test("the bot's own recommended invite permissions never include Administrator", () => {
  assert.doesNotThrow(() => assertNoAdministrator(BOT_RECOMMENDED_PERMISSIONS, "bot invite"));
});

test("every ROLE_DEFINITIONS permission name is a real discord.js permission flag", () => {
  for (const role of ROLE_DEFINITIONS) {
    assert.doesNotThrow(
      () => buildPermissions(role.permissions, `role:${role.key}`),
      `Role "${role.key}" has an invalid permission flag name`
    );
  }
});

// ── canModerate hierarchy tests ─────────────────────────────────────
// These require the database (role.* config lookups), so we
// initialize an in-memory DB and seed role IDs the same way
// discord-sync.js would after a real bootstrap run.

const { initDatabase, setConfig } = await import("../src/core/database.js");
initDatabase();
setConfig("role.admin", "role-admin-id");
setConfig("role.moderator", "role-mod-id");
setConfig("role.mentor", "role-mentor-id");
setConfig("role.verified", "role-verified-id");
setConfig("role.member", "role-member-id");

function fakeMember(id, roleIds = []) {
  return { id, roles: { cache: { has: (roleId) => roleIds.includes(roleId) } } };
}

test("canModerate: a member cannot moderate themselves", () => {
  const admin = fakeMember("u1", ["role-admin-id"]);
  assert.equal(canModerate(admin, admin), false);
});

test("canModerate: Admin can moderate Moderator", () => {
  const admin = fakeMember("u1", ["role-admin-id"]);
  const mod = fakeMember("u2", ["role-mod-id"]);
  assert.equal(canModerate(admin, mod), true);
});

test("canModerate: Moderator cannot moderate Admin", () => {
  const mod = fakeMember("u2", ["role-mod-id"]);
  const admin = fakeMember("u1", ["role-admin-id"]);
  assert.equal(canModerate(mod, admin), false);
});

test("canModerate: Moderator cannot moderate another Moderator (equal rank)", () => {
  const mod1 = fakeMember("u2", ["role-mod-id"]);
  const mod2 = fakeMember("u3", ["role-mod-id"]);
  assert.equal(canModerate(mod1, mod2), false);
});

test("canModerate: any staff can moderate a plain member with no staff role", () => {
  const mentor = fakeMember("u4", ["role-mentor-id"]);
  const plainMember = fakeMember("u5", ["role-member-id"]);
  assert.equal(canModerate(mentor, plainMember), true);
});

test("canModerate: a non-staff member cannot moderate anyone", () => {
  const plainMember = fakeMember("u5", ["role-member-id"]);
  const otherMember = fakeMember("u6", ["role-verified-id"]);
  assert.equal(canModerate(plainMember, otherMember), false);
});

test("canModerate: the Owner can moderate an Admin", () => {
  const owner = fakeMember("owner-123", []);
  const admin = fakeMember("u1", ["role-admin-id"]);
  assert.equal(canModerate(owner, admin), true);
});

test("canModerate: no one can moderate the Owner", () => {
  const admin = fakeMember("u1", ["role-admin-id"]);
  const owner = fakeMember("owner-123", []);
  assert.equal(canModerate(admin, owner), false);
});
