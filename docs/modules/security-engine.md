# Security Engine

## Purpose

Protects the community from raids, spam, scams/phishing, and NSFW
content, and gives staff a live, queryable audit trail — all using
free, self-contained methods (no paid threat-intel or moderation API).

## Components

| Component | File | Method |
|---|---|---|
| Permission System | `core/permissions.js` | Role-hierarchy checks, Owner override, `canModerate` rank comparison, hard Administrator block |
| AutoMod | `modules/moderation-automod/automod.js` | Native Discord AutoMod rules (keyword filter, mention-spam guard) |
| Anti-Raid | `modules/moderation-automod/antiRaid.js` | Join-rate detection → temporary verification-level raise + new-account auto-kick |
| Anti-Spam | `modules/moderation-automod/antiSpam.js` | Per-user in-memory rate limiting + duplicate-message flood detection → timeout |
| Anti-Scam / Anti-Phishing | `modules/moderation-automod/antiPhishing.js` | URL extraction + domain blocklist + lookalike-domain heuristics → delete, escalating to timeout for repeat offenders |
| NSFW Protection | `modules/moderation-automod/nsfw.js` | Discord's native Explicit Content Filter (`AllMembers` level) — free, built-in image scanning |
| Logging | `modules/moderation-automod/logging.js` | Mirrors native Discord audit log + AutoMod executions to DB and staff channels |
| Audit System | `core/database.js` (`audit_log` table) + `/audit` command | Every bot-driven action and mirrored Discord audit entry is queryable |

## Setup

Nothing to configure manually — `setupSecurity(guild)` runs
automatically on every bot startup (`events/ready.js`) and is
idempotent (safe to run repeatedly; never removes existing rules).

Requires the bot to have `ManageGuild`, `ManageMessages`,
`ModerateMembers`, `KickMembers`, `ViewAuditLog` — all included in
`BOT_RECOMMENDED_PERMISSIONS` in `server-map.js`. None of this
requires `Administrator`.

## How Each Protection Works

### Anti-Raid
Tracks join timestamps per guild in memory. 6+ joins within 15 seconds
triggers "raid mode": verification level is temporarily raised to
`High`, and any account younger than 7 days that joins during the
raid-mode window is automatically kicked (not banned — reversible).
Raid mode auto-expires after 10 minutes of no further trigger, reverting
verification level. A `#mod-logs` alert is posted on entry and exit.

### Anti-Spam
Per-user in-memory tracking of message timestamps and content. More
than 5 messages in 5 seconds, or the same message repeated 3+ times in
a row, deletes the flood and times the member out for 5 minutes.

### Anti-Phishing / Anti-Scam
Every message is scanned for URLs. Each URL's domain is checked
against a maintained blocklist (`BLOCKED_DOMAINS` in
`antiPhishing.js`) and a set of heuristic patterns (punycode
homographs, common brand-impersonation patterns). A match deletes the
message immediately; a member's 3rd offense in 24 hours escalates to a
10-minute timeout. To add a newly discovered scam domain, add it to
`BLOCKED_DOMAINS` — no redeploy logic needed beyond a normal code
update.

### NSFW Protection
Sets the guild's Explicit Content Filter to scan media from all
members — this is Discord's own free, built-in image-scanning
infrastructure. No external API, no cost, no image ever leaves
Discord's systems for a third-party scan.

### Logging & Audit
Two independent event listeners (`guildAuditLogEntryCreate`,
`autoModerationActionExecution`) capture everything Discord itself
records, plus every bot-driven action calls `logAudit()` directly.
Staff can review recent activity anytime with `/audit recent`, or
check overall posture with `/security status`.

## Slash Commands

- `/security status` — raid mode, explicit content filter, AutoMod
  rule count, verification level (Admin+)
- `/audit recent [count] [filter]` — recent audit log entries,
  optionally filtered by action substring (Moderator+)

## Known Limitations (Documented, Not Silent)

- Anti-raid and anti-spam state is **in-memory**, not persisted. A bot
  restart resets active raid-mode/rate-limit tracking. This is an
  accepted tradeoff for a free, self-hosted bot with no paid
  always-on infrastructure requirement — a restart during an active
  raid is rare, and the native Discord verification-level setting
  (if raised) persists on Discord's side regardless of bot uptime.
- The phishing domain blocklist is maintained by hand in source, not
  fed by a live threat-intel API (which would typically be a paid
  service). It covers common, well-known scam patterns but is not
  exhaustive — this is disclosed, not hidden.
- NSFW protection relies on Discord's own detection accuracy; it is
  not a custom-trained classifier.

## Troubleshooting

- **AutoMod rules aren't being created**: check the bot has
  `ManageGuild` — `auditBotPermissions()` logs a warning on startup if
  any recommended permission is missing.
- **Audit log entries aren't appearing in `#audit-logs`**: confirm
  `channel.audit-logs` exists in the config table (run
  `bootstrap-server.js` if not) and the bot has `ViewAuditLog`.
- **A legitimate link keeps getting deleted**: it matched a heuristic
  pattern too broadly — remove or narrow the relevant entry in
  `SUSPICIOUS_PATTERNS` in `antiPhishing.js`.
