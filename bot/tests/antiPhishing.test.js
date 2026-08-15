// bot/tests/antiPhishing.test.js
//
// Integration tests for the real phishing detector using an in-memory
// database so moderation logging and repeat-offense counting exercise
// the same production code path used by the bot.

import { test, before } from "node:test";
import assert from "node:assert/strict";

process.env.DISCORD_BOT_TOKEN ??= "test-token";
process.env.DISCORD_CLIENT_ID ??= "test-client-id";
process.env.DISCORD_GUILD_ID ??= "test-guild-id";
process.env.DATABASE_PATH ??= ":memory:";
process.env.NODE_ENV = "test";

const { initDatabase } = await import("../src/core/database.js");
const { checkMessageForPhishing } = await import("../src/modules/moderation-automod/antiPhishing.js");

before(() => {
  initDatabase();
});

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

test("checkMessageForPhishing: valid punycode homograph domain is flagged", async () => {
  const msg = makeFakeMessage("look at this https://xn--dscord-pvf.com/gift");
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
