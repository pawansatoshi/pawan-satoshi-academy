# Project Status

Last updated: live Discord deployment + curriculum completion + XP/leaderboard implementation.

## Phase Progress

| Phase | Status | Summary |
|---|---|---|
| 0 — Planning & Scaffold | ✅ Complete | Repo structure, governance files, CI |
| 1 — Discord Foundation | ✅ Complete | Core infra, bootstrap, welcome, verification, roles, Event Management |
| 2 — Security Engine | ✅ Complete | Permissions, AutoMod, anti-raid, anti-spam, anti-phishing, NSFW, logging, audit |
| 2 remainder — XP/Leaderboard | 🟡 Implemented, smoke-test pending | XP/levels/streaks are awarded from quiz button interactions; `/leaderboard` is available |
| 3A — Quiz Engine | ✅ Complete | Schema, validator, loader, randomizer, sessions, `/quiz`, `/assessment`, event integration |
| 3A-ext — Required Assessments & Progress | ✅ Complete | Chapter/Final assessment engine, curriculum unlocks, class completion tracking |
| 3B — Question Bank Content | ✅ Complete — 22/22 subjects, 637 questions | Mastery-based question content |
| 3C — Academy Lesson Content | ⬜ Pending | Long-form lesson Markdown |
| 3D — Certificates | ⬜ Pending | PDF generation, unique IDs, public verification |
| 4 — Automation & Community Operations | 🟡 Partial | Recurring quiz automation and leaderboard live; tickets, exports, study groups and activities remain |
| 5 — Website | ⬜ Pending | Mobile-first GitHub Pages application |
| 6 — AI Helper | ⬜ Pending | Retrieval-first assistant after lesson corpus |
| 7 — Growth & Launch Hardening | ⬜ Pending | Badges, games, audits and final launch checklist |
| Live Discord | ✅ Running | Server bootstrap applied; 7 roles + 32 mapped channels synchronized; bot online |

## Question Bank Content

637 validated questions across all 22 curriculum subjects:

| # | Subject | Questions |
|---|---|---:|
| 1 | Orientation | 42 |
| 2 | Internet Basics | 45 |
| 3 | Digital Literacy | 33 |
| 4 | Cyber Security | 43 |
| 5 | Password Safety | 34 |
| 6 | Digital Payments | 31 |
| 7 | AI | 30 |
| 8 | Prompt Engineering | 22 |
| 9 | Git & GitHub | 35 |
| 10 | Linux | 30 |
| 11 | Programming | 28 |
| 12 | Bitcoin | 45 |
| 13 | Blockchain | 25 |
| 14 | Ethereum | 28 |
| 15 | Base | 20 |
| 16 | Stablecoins | 21 |
| 17 | DeFi | 25 |
| 18 | Wallet Security | 20 |
| 19 | Web3 | 20 |
| 20 | Testnets | 20 |
| 21 | Ambassador Programs | 20 |
| 22 | Community Management | 20 |

## Automatic Quiz

The scheduler runs every 60 seconds and performs an immediate startup tick. On first successful startup after `#quiz-arena` is synchronized, the bot creates a persistent `daily-community-quiz` recurring event if one does not already exist.

Default schedule: **09:00 IST daily**, configurable with `DAILY_QUIZ_HOUR_IST`. Default question count: **1**, configurable with `DAILY_QUIZ_COUNT`. The event then lives in SQLite and can be managed with `/event list`, `/event edit`, `/event disable` and `/event resume` without redeploying.

## XP / Leveling

Quiz answers now award XP automatically through the interaction layer:

- Correct answer: 10 XP
- Attempted incorrect answer: 2 XP
- Level: 1 level per 100 XP
- Daily activity streak is persisted on the member record
- `/leaderboard` shows the top 10 members with XP

This is intentionally derived from actual quiz interactions rather than message count or arbitrary activity.

## Live Deployment Verification

The live Render logs previously confirmed:

- database initialized
- 537 questions loaded with zero rejected questions before the final five banks were added
- all 7 roles created
- all 32 mapped channels created
- all IDs synchronized
- slash commands registered successfully
- health server listening on port 10000
- bot logged in
- security engine initialized
- scheduler started with 60-second ticks
- startup sequence completed

The current repository adds the remaining five question banks, daily quiz seeding and XP/leaderboard code. Render auto-deploy should run from the new commits; the resulting logs must be treated as the final runtime smoke-test evidence.

## Security Rules

- Never commit Discord tokens or API keys.
- Never grant the bot Administrator for normal operation.
- Never force-push deployment recovery.
- Never automatically delete existing Discord channels, roles or bots.
- Keep third-party bots untouched until replacement functionality is validated.
