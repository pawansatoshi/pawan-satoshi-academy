# Project Status

Last updated: Live-deployment preparation + CI hardening.

## Phase Progress

| Phase | Status | Summary |
|---|---|---|
| 0 — Planning & Scaffold | ✅ Complete | Repo structure, governance files, CI |
| 1 — Discord Foundation | ✅ Complete | Core infra, bootstrap-server.js, welcome, verification, roles, Event Management |
| 2 — Security Engine | ✅ Complete | Permissions, AutoMod, anti-raid, anti-spam, anti-phishing, NSFW, logging, audit |
| 3A — Quiz Engine | ✅ Complete | Schema, validator, loader, randomizer, sessions, `/quiz`, `/assessment`, event integration |
| 3A-ext — Required Assessments & Progress | ✅ Complete | Chapter/Final assessment engine, curriculum unlocks, class completion tracking |
| 3B — Question Bank Content | 🟡 In Progress (17/22 subjects) | Mastery-based question content |
| 3C — Academy Lesson Content | ⬜ Not started | Long-form lesson Markdown |
| 3D — Certificates | ⬜ Not started | PDF generation, unique IDs, verification |
| XP/Leaderboard | ⬜ Not started | Quiz attempts already record the required base data |
| Automation & Tickets | ⬜ Not started | Tickets, exports and additional automation |
| Website | ⬜ Not started | GitHub Pages application |
| AI Helper | ⬜ Not started | Retrieval-based assistant after lesson corpus exists |
| Growth | ⬜ Not started | Mentors, contributors, partnerships |
| Live Discord | 🟡 Deployment-ready | Bot bootstrap, command deployment and persistent runtime guide added; live server has not yet been modified |

## Quiz System Rules

| Mode | Required? | Retries | Gates progression? |
|---|---|---|---|
| Practice | Optional | Unlimited | No |
| Daily Quiz | Optional | Unlimited | No |
| Weekly Quiz | Optional | Unlimited | No |
| Challenge Quiz | Optional | Unlimited | No |
| **Chapter Assessment** | **Required** | Unlimited | Yes — 70% pass threshold |
| **Final Examination** | **Required** | Unlimited | Yes — 75% pass threshold and required for graduation certificate |

## Question Bank Content

537 questions across 17 subjects are currently in the repository:

| # | Subject | Questions | Status |
|---|---|---:|---|
| 1 | Orientation | 42 | ✅ |
| 2 | Internet Basics | 45 | ✅ |
| 3 | Digital Literacy | 33 | ✅ |
| 4 | Cyber Security | 43 | ✅ |
| 5 | Password Safety | 34 | ✅ |
| 6 | Digital Payments | 31 | ✅ |
| 7 | AI | 30 | ✅ |
| 8 | Prompt Engineering | 22 | ✅ |
| 9 | Git & GitHub | 35 | ✅ |
| 10 | Linux | 30 | ✅ |
| 11 | Programming | 28 | ✅ |
| 12 | Bitcoin | 45 | 🟡 Expand later for deeper mastery |
| 13 | Blockchain | 25 | ✅ |
| 14 | Ethereum | 28 | ✅ |
| 15 | Base | 20 | ✅ |
| 16 | Stablecoins | 21 | ✅ |
| 17 | DeFi | 25 | ✅ |
| 18 | Wallet Security | — | ⬜ Next |
| 19 | Web3 | — | ⬜ |
| 20 | Testnets | — | ⬜ |
| 21 | Ambassador Programs | — | ⬜ |
| 22 | Community Management | — | ⬜ |

Cross-bank validation checks duplicate IDs, duplicate question text and topic overlap.

## CI Validation

The GitHub Actions bot validation now runs against the real repository with Node.js 22 and `npm install`.

Latest validation result:

**86/86 tests passing; lint passing.**

The CI run also exposed and fixed two real portability/test issues from the handoff:

1. Node test discovery was changed from `node --test tests/` to an explicit `tests/*.test.js` glob.
2. Anti-phishing integration tests now initialize the in-memory database and use a valid punycode fixture.

A security review also fixed `canModerate()` so non-staff community tiers cannot accidentally gain moderation authority, and the bootstrap role ordering was corrected so Academy roles remain below the bot's highest role.

## Live Discord Deployment

The repository now contains:

- `docs/DISCORD_LIVE_DEPLOYMENT.md`
- `deploy/oracle/install.sh`

The installer is designed for a free-first Oracle Always Free VM and creates a systemd service with a root-owned `600` environment file. It does not start the bot or modify Discord automatically until the operator reviews the bootstrap dry-run.

The live server has **not** been modified yet.

## Security Rules

- Never commit Discord tokens or API keys.
- Never grant the bot Administrator.
- Never force-push deployment recovery.
- Never automatically delete existing Discord channels, roles or bots.
- Always run the Discord bootstrap dry-run before `--confirm`.
- Keep the five existing third-party bots untouched until replacement functionality is tested.

## Next Steps

1. Create/configure the Discord Application and bot.
2. Invite it to the existing server with least privilege.
3. Provision the free-first persistent runtime.
4. Run bootstrap dry-run.
5. Review and apply the Discord structure.
6. Register slash commands.
7. Start and smoke-test the bot.
8. Continue the remaining five curriculum subjects and then the remaining product phases.
