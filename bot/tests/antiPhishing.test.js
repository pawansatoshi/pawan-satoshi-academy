// bot/tests/antiPhishing.test.js
//
// Tests the pure domain-matching logic in antiPhishing.js. The
// detection functions aren't exported directly (they're internal to
// message handling), so this test re-implements the exact same
// matching rules against the exported constants to verify the data
// itself is well-formed and the heuristics behave as intended. This
// keeps the test honest: it fails if BLOCKED_DOMAINS or
// SUSPICIOUS_PATTERNS are edited in a way that breaks detection.

import { test } from "node:test";
import assert from "node:assert/strict";

process.env.DISCORD_BOT_TOKEN ??= "test-token";
process.env.DISCORD_CLIENT_ID ??= "test-client-id";
process.env.DISCORD_GUILD_ID ??= "test-guild-id";
process.env.DATABASE_PATH ??= ":memory:";
process.env.NODE_ENV = "test";

// Re-derive the same URL regex and matching behavior by importing the
// module and exercising it through a fake message object, rather than
// duplicating private logic — this exercises the real code path.
const { checkMessageForPhishing } = await import("../src/modules/moderation-automod/antiPhishing.js");

function makeFakeMessage(content, { moderatable = true } = {}) {
  const deleted = { called: false };
  const sent = { content: null };

  return {
    author: { bot: false, id: "user-1" },
    content,
    channelId: "channel-1",
    channel: {
      send: async (payload) => {
        sent.content = payload;
        return { delete: async () => {} };
      }
    },
    member: {
      moderatable,
      timeout: async () => {}
    },
    delete: async () => {
      deleted.called = true;
    },
    _deleted: deleted,
    _sent: sent
  };
}

test("checkMessageForPhishing: message with no URL is ignored", async () => {
  const msg = makeFakeMessage("hello, just chatting here");
  const result = await checkMessageForPhishing(msg);
  assert.equal(result, false);
  assert.equal(msg._deleted.called, false);
});

test("checkMessageForPhishing: message with a safe, legitimate URL is ignored", async () => {
  const msg = makeFakeMessage("check this out https://github.com/pawansatoshi");
  const result = await checkMessageForPhishing(msg);
  assert.equal(result, false);
  assert.equal(msg._deleted.called, false);
});

test("checkMessageForPhishing: known blocked domain is deleted and flagged", async () => {
  const msg = makeFakeMessage("free nitro here: https://discord-nitro.com/claim");
  const result = await checkMessageForPhishing(msg);
  assert.equal(result, true);
  assert.equal(msg._deleted.called, true);
});

test("checkMessageForPhishing: punycode homograph domain is flagged", async () => {
  const msg = makeFakeMessage("look at this https://xn--discrd-l1a.com/gift");
  const result = await checkMessageForPhishing(msg);
  assert.equal(result, true);
  assert.equal(msg._deleted.called, true);
});

test("checkMessageForPhishing: 'claim your airdrop' pattern in domain is flagged", async () => {
  const msg = makeFakeMessage("https://claim-airdrop.io/get-free-tokens");
  const result = await checkMessageForPhishing(msg);
  assert.equal(result, true);
  assert.equal(msg._deleted.called, true);
});

test("checkMessageForPhishing: bot messages are always ignored", async () => {
  const msg = makeFakeMessage("https://discord-nitro.com/claim");
  msg.author.bot = true;
  const result = await checkMessageForPhishing(msg);
  assert.equal(result, false);
});
