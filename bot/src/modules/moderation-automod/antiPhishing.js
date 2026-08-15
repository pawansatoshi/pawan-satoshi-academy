// bot/src/modules/moderation-automod/antiPhishing.js
//
// Extracts URLs from messages and checks them against a maintained
// blocklist plus lookalike-domain heuristics (punycode, common
// brand-impersonation patterns). Free, self-contained — no external
// API or paid threat-intel service required, per project cost policy.
// Repeat offenders escalate from warn -> delete -> timeout using the
// existing moderation_events table as the offense counter (no new
// table needed).

import { logAudit, logModerationEvent, countModerationEventsSince } from "../../core/database.js";
import { getLogger } from "../../core/logger.js";

const logger = getLogger("anti-phishing");

const URL_REGEX = /https?:\/\/[^\s<>"']+/gi;

// Known scam/phishing domains and patterns common in crypto/Discord
// scams. Maintained as plain data so it can be extended without
// touching logic — see docs/modules/anti-phishing.md for the update
// process.
const BLOCKED_DOMAINS = [
  "discord-nitro.com", "discordgift.site", "discord-airdrop.com",
  "steamcommunlty.com", "steamcommunity.ru", "dlscord.com", "disc0rd.com",
  "discrod.com", "dicsord.com", "discordapp.gift", "discord-gift.com",
  "opensea-nft.io", "metamask-support.com", "metamask-wallet.io",
  "coinbase-support.net", "binance-airdrop.com", "free-crypto-claim.com",
  "wallet-verify.com", "claim-airdrop.io"
];

const SUSPICIOUS_PATTERNS = [
  /^xn--/i,                                   // punycode homograph domains
  /discord[a-z0-9]*\.(?!com|gg|com\.au)/i,     // "discord"-prefixed non-official TLD
  /steam[a-z0-9]*community/i,                  // steamcommunity lookalikes not on steamcommunity.com
  /free-?nitro/i,
  /claim-?(your-?)?airdrop/i
];

function extractDomain(url) {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return null;
  }
}

function isSuspiciousDomain(domain) {
  if (!domain) return false;
  if (BLOCKED_DOMAINS.includes(domain)) return true;
  return SUSPICIOUS_PATTERNS.some((pattern) => pattern.test(domain));
}

/**
 * Call from messageCreate. Returns true if the message was flagged
 * and handled (deleted + logged, and escalated to timeout for
 * repeat offenders).
 */
export async function checkMessageForPhishing(message) {
  if (message.author.bot || !message.content) return false;

  const urls = message.content.match(URL_REGEX) || [];
  if (urls.length === 0) return false;

  const flaggedDomains = urls.map(extractDomain).filter(isSuspiciousDomain);
  if (flaggedDomains.length === 0) return false;

  await message.delete().catch(() => {});

  logModerationEvent({
    eventType: "phishing_block",
    memberId: message.author.id,
    channelId: message.channelId,
    contentSnippet: flaggedDomains.join(", ")
  });
  logAudit("phishing_blocked", "bot", message.author.id, { domains: flaggedDomains });
  logger.warn({ memberId: message.author.id, domains: flaggedDomains }, "Phishing/scam link blocked");

  const offenseCount = countRecentOffenses(message.author.id);

  if (offenseCount >= 3 && message.member?.moderatable) {
    await message.member.timeout(10 * 60_000, "Anti-phishing: repeated scam link posting").catch(() => {});
    logger.warn({ memberId: message.author.id, offenseCount }, "Member timed out for repeated phishing links");
  } else {
    const warning = await message.channel
      .send(`⚠️ ${message.author}, that link was removed — it matched a known scam/phishing pattern. If you believe this is a mistake, contact a moderator.`)
      .catch(() => null);
    if (warning) setTimeout(() => warning.delete().catch(() => {}), 15_000);
  }

  return true;
}

function countRecentOffenses(memberId) {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60_000).toISOString();
  return countModerationEventsSince("phishing_block", memberId, oneDayAgo);
}
