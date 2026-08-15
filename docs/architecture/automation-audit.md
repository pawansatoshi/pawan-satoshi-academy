# Automation Coverage Audit

Goal: automate everything Discord's API and GitHub's free tooling
legally and technically allow. This document separates what the bot
can do for you vs. the small, unavoidable set of manual steps — and
this changes Phase 1: instead of you manually creating ~58 channels
and 7 roles by hand, the bot will do it via one bootstrap script.

---

## 1. Fully Automatable (bot handles this — zero manual steps)

| Task | How |
|---|---|
| Server rename | `guild.setName()` — one API call |
| Category creation | `guild.channels.create()`, type `GuildCategory` |
| Text/forum channel creation | `guild.channels.create()`, correct type + parent category |
| Channel permission overwrites (progressive unlock) | `channel.permissionOverwrites.set()` |
| Role creation + hierarchy ordering | `guild.roles.create()` + `guild.roles.setPositions()` |
| Verification level / AutoMod rules | `guild.setVerificationLevel()`, `guild.autoModerationRules.create()` |
| Slash command registration | `REST` API deploy script, run on every deploy |
| Welcome flow, verification, role assignment | Bot event handlers |
| XP, leveling, leaderboard | Bot logic + scheduled jobs |
| Quiz posting (daily/weekly/monthly) | `automation/scheduler` (cron-style, e.g. `node-cron`) |
| Certificate generation + issuance | Bot logic, triggered on eligibility |
| Ticket creation/closing/logging | Bot logic |
| Meeting reminders | Scheduled job |
| Moderation actions within granted permissions (mute, warn, delete message) | Bot logic, bounded by permission matrix |
| Website data export (leaderboard, cert registry) | `automation/export`, scheduled |
| Website build + deploy | GitHub Actions (`deploy-pages.yml`, already built) |
| Lint/test on every push | GitHub Actions (`test.yml`, already built) |
| Database migrations | `npm run migrate` |
| Retiring an old bot's *permissions* (demote its role, strip access) | `guild.members.fetch()` + role/permission edits |

**This covers the entire server rebuild** (categories, channels, roles,
permissions) — it does not need to be done by hand in the Discord app.
It runs as a single script: `npm run bootstrap:server` (built in
Phase 1, gated behind a `--confirm` flag and a dry-run mode so you can
review the exact diff before it touches the live server).

---

## 2. Technically Possible, Deliberately Kept Manual (safety gate, not a limitation)

| Task | Why it's a deliberate checkpoint, not a Discord limitation |
|---|---|
| Removing an old bot entirely (Welcomer, Captcha.bot, MEE6, Statbot, TBOOK Bot) | The bot *could* kick another bot via API, but your instruction was explicit: retire only after you've reviewed and approved each replacement. This stays a manual "Kick"/"Remove Integration" click by you, by design. |
| Final approval before `bootstrap:server` runs against the live server | Dry-run output requires your sign-off before the real run, per your standing "wait for approval" pattern on structural changes |
| Deleting any channel (vs. archiving) | Per doc 17 ("archive, don't delete") and your no-data-loss requirement — deletion is never automated |

These aren't things Discord blocks — they're things left manual on
purpose as safety checkpoints. I want to be explicit about that
distinction rather than blur it with the genuine limitations below.

---

## 3. Genuinely Not Automatable (Discord/GitHub platform limitations)

| Task | Why | Minimal manual step |
|---|---|---|
| Creating the Discord Application + Bot user | No API exists to create an application from outside the Developer Portal — this is Discord's own anti-abuse boundary | One-time: create app at discord.com/developers, ~2 minutes |
| Inviting the bot to the server with the right OAuth2 scopes | Invite links require a human click to authorize — a bot cannot add itself to a server it isn't already in | One-time: click generated invite link, approve requested (least-privilege) permissions |
| Storing the bot token / secrets | An agent should never handle or transmit your live secrets — this is a security boundary, not a Discord limitation | One-time: paste token into `.env` (local) or GitHub Secrets (CI) yourself |
| Enabling 2FA on your Owner account and staff accounts | Discord requires this be done by the account holder directly | One-time per staff member, via Discord's own security settings |
| Server Owner transfer / deletion | Discord deliberately restricts these to manual, deliberate action by the Owner — and per your rules, this should never happen anyway | N/A — never automated, never requested |
| GitHub repository creation + first push | GitHub's own account-level action | One-time: create repo, `git push` (or GitHub app "create from template") |
| Adding `DISCORD_BOT_TOKEN` etc. to GitHub Secrets | Same secret-handling boundary as above | One-time per secret, via repo Settings → Secrets |
| Discord "Community" server feature toggle (if not already enabled) | Requires accepting Discord's Community Guidelines via the UI — human consent required | One-time toggle in Server Settings |

---

## 4. Minimal Manual Footprint — Full List

Everything manual, end to end, across the entire project:

1. Create the Discord Application + Bot user in the Developer Portal (~2 min)
2. Click the generated invite link to add the bot to your server, approving the requested (non-Administrator) permissions
3. Paste the bot token into `.env` (local dev) and GitHub Secrets (CI)
4. Enable 2FA on your account (if not already on) — Discord's own settings
5. Create the GitHub repository and push this codebase (or use "Import" from the GitHub mobile app)
6. Add repo secrets in GitHub Settings → Secrets
7. Review the `bootstrap:server` dry-run output, then approve the real run
8. After each old-bot replacement is tested: manually remove that one old bot (by design, per your instruction)

**That's the entire manual surface for the whole project** — 8 one-time
(or per-bot, for step 8) actions. Everything else — every channel,
role, permission, quiz, certificate, reminder, and moderation action —
runs automatically once the bot is live.

---

## 5. Legal/Platform Compliance Notes

- All automation uses the official Discord Bot API via `discord.js` —
  no self-bots, no user-account automation, no scraping. This keeps
  every automated action within Discord's Developer Terms of Service.
- The bot never requests the `Administrator` permission — every
  automated action is scoped to exactly what its module needs, per
  your standing safety rule.
- Rate limits: Discord enforces per-route rate limits on channel/role
  creation. The bootstrap script batches creation with built-in delay
  handling so a ~58-channel, 7-role rebuild completes without hitting
  them — this is handled in code, not a manual concern for you.

---

## What Changes in Phase 1

Given this, Phase 1 now includes a `scripts/bootstrap-server.js` in
addition to `core/*` and the `welcome`/`verification`/`roles` modules:
it reads the approved server map, diffs it against the live server's
current state, prints a dry-run report, and — only on your explicit
`--confirm` — creates/renames everything in one automated pass.

Ready to proceed with Phase 1 including this bootstrap script?
