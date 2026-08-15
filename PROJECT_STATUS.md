# Project Status

Last updated: Phase 3A finalization (this session) — includes required
Chapter Assessment / Final Examination engine and 2 completed
question banks.

## Phase Progress

| Phase | Status | Summary |
|---|---|---|
| 0 — Planning & Scaffold | ✅ Complete | Repo structure, governance files, CI |
| 1 — Discord Foundation | ✅ Complete | Core infra, bootstrap-server.js, welcome, verification, roles, Event Management module |
| 2 — Security Engine | ✅ Complete | Full security stack (permissions, AutoMod, anti-raid, anti-spam, anti-phishing, NSFW, logging, audit) |
| 3A — Quiz Engine | ✅ Complete | Schema, validator, loader, randomizer, session engine, `/quiz`, `/assessment`, Event Management integration |
| 3A-ext — Required Assessments & Progress | ✅ Complete | Chapter Assessment / Final Examination engine, curriculum unlock logic, `class_completions` tracking |
| 3B — Question Bank Content | 🟡 In Progress (17/22 subjects) | Mastery-based, generated incrementally in approved priority order |
| 3C — Academy Lesson Content | ⬜ Not started | Long-form lesson Markdown for GitHub Pages |
| 3D — Certificates | ⬜ Not started | PDF generation, unique IDs, verification |
| 2 (remainder) — XP/Leaderboard | ⬜ Not started | Unblocked; quiz_attempts already records everything XP will need |
| 4 — Automation & Tickets | ⬜ Not started | Ticket system, export pipeline |
| 5 — Website | ⬜ Not started | Folder structure exists, no content |
| 6 — AI Helper | ⬜ Not started | Needs Academy lesson content first |
| 7 — Growth | ⬜ Not started | Mentors, contributors, partnerships |

## Quiz System Rules (implemented exactly as specified)

| Mode | Required? | Retries | Gates progression? |
|---|---|---|---|
| Practice | Optional | N/A | No |
| Daily Quiz | Optional | N/A | No |
| Weekly Quiz | Optional | N/A | No |
| Challenge Quiz | Optional | N/A | No |
| **Chapter Assessment** | **Required** | Unlimited | Yes — unlocks next class (70% pass threshold) |
| **Final Examination** | **Required** | Unlimited | Yes — required for Graduation Certificate (75% pass threshold) |

Every wrong answer, in every mode, immediately shows: correct answer,
explanation, reference (where one exists), and a suggested topic to
review. Implemented in `modules/quiz-engine/index.js`.

## Phase 3A + Extension Deliverables (this update)

1. `quizzes/schema/question-schema.json` + `subject-class-mapping.json` — canonical formats/mapping
2. `validator.js`, `loader.js`, `shuffle.js`, `randomizer.js` — engine internals (dependency-free where possible, real-tested)
3. `modules/quiz-engine/index.js` — generalized session engine covering all 6 quiz modes
4. `modules/progress/` — pure curriculum-unlock logic (`curriculum.js`) + DB-backed wrapper (`index.js`)
5. New DB tables: `quiz_attempts`, `community_quiz_answers`, `class_completions`
6. Commands: `/quiz practice`, `/quiz stats`, `/assessment chapter`, `/assessment final`, `/assessment progress`
7. Event Management integration: `/event create type:quiz` posts real quizzes
8. Docs: `docs/modules/quiz-engine.md`

## Question Bank Content Queue (mastery-based, no fixed count)

| # | Subject | Status | Question Count |
|---|---|---|---|
| 1 | Orientation | ✅ Complete | 42 |
| 2 | Internet Basics | ✅ Complete | 45 |
| 3 | Digital Literacy | ✅ Complete | 33 |
| 4 | Cyber Security | ✅ Complete | 43 |
| 5 | Password Safety | ✅ Complete | 34 |
| 6 | Digital Payments | ✅ Complete | 31 |
| 7 | AI | ✅ Complete | 30 |
| 8 | Prompt Engineering | ✅ Complete | 22 |
| 9 | Git & GitHub | ✅ Complete | 35 |
| 10 | Linux | ✅ Complete | 30 |
| 11 | Programming | ✅ Complete | 28 |
| 12 | Bitcoin | 🟡 Solid start, expand further | 45 |
| 13 | Blockchain | ✅ Complete | 25 |
| 14 | Ethereum | ✅ Complete | 28 |
| 15 | Base | ✅ Complete | 20 |
| 16 | Stablecoins | ✅ Complete | 21 |
| 17 | DeFi | ✅ Complete | 25 |
| 18 | Wallet Security | ⬜ Next | — |
| 19 | Web3 | ⬜ | — |
| 20 | Testnets | ⬜ | — |
| 21 | Ambassador Programs | ⬜ | — |
| 22 | Community Management | ⬜ | — |

## Test Status — all executable tests actually run, zero mocked results

| Test file | Status |
|---|---|
| `tests/recurrence.test.js` | ✅ 12/12 passing, executed in-sandbox |
| `tests/quizEngine.test.js` | ✅ 41/41 passing, executed in-sandbox — validates all 17 real content files live, pairwise + global overlap checks, topic-diversity ratio check, investment-advice-language detection |
| `tests/curriculum.test.js` | ✅ 11/11 passing, executed in-sandbox — validates mapping file + cross-checks against real Orientation data |
| `tests/permissions.test.js` | ✅ Syntax-verified, 15 cases, requires `npm install` (network) — runs in CI |
| `tests/antiPhishing.test.js` | ✅ Syntax-verified, 6 cases, requires `npm install` (network) — runs in CI |

**64 tests executed for real in this session, zero failures.** Full
syntax sweep: 38 source files, all pass `node --check`.

Total question bank content: **537 questions across 17 subjects**,
zero duplicate IDs, zero duplicate question text, zero topic overlap
between subjects — all verified programmatically, not just asserted,
and permanently encoded as automated tests that re-check this on
every future addition.

**Crypto content accuracy methodology (Bitcoin through DeFi)**: every
historical/factual claim was verified via web_search against primary
or highly credible sources before being written — including
Ethereum's Merge date and energy-reduction figure (verified against
ethereum.org directly), Base's launch timeline and no-native-token
policy (verified against Coinbase's own announcement), the GENIUS
Act's signing date and reserve requirements (verified against the
White House fact sheet and multiple law-firm legal analyses), and the
Poly Network/Ronin exploit figures (verified against multiple
independent sources, with appropriately hedged dollar amounts given
minor source-to-source variance). Version/network-dependent facts
(like Base's OP Stack relationship, which changed in Feb 2026) are
explicitly flagged as subject to change rather than stated as
permanent — see `base-006` for a worked example of this discipline.

**DeFi content note**: per the user's explicit rule against investment
advice/price speculation, DeFi content sticks to factual mechanism and
risk description (impermanent loss, smart contract risk, oracle
manipulation, rug pulls, historical exploits) with zero recommendations
for or against any protocol. A new automated test now scans all DeFi
content for investment-advice language patterns as a permanent
safeguard.

**Bitcoin content note**: still flagged as an incomplete "large
subject" (45 questions vs. 300-500+ target) — expand further in a
future session.

## Manual Setup Steps (unchanged — see automation-audit.md for full detail)

1. Create Discord Application + Bot in Developer Portal
2. Enable privileged intents: Guild Members, Message Content
3. Invite bot using `BOT_RECOMMENDED_PERMISSIONS` from `server-map.js`
4. Fill in `bot/.env`
5. `npm install` (needs network — not available in build sandbox)
6. `npm run bootstrap:server` dry run → review → `-- --confirm`
7. `npm run deploy:commands`
8. `npm start`

## Open Questions (still unanswered)

- What does TBOOK Bot do?
- Is MEE6 Premium active?

## Next Recommended Action

Continue Phase 3B: generate the Wallet Security question bank (next
in approved priority order — keep strictly separate from both DeFi's
protocol-level risks and the general Cyber Security subject's broad
threat landscape; Wallet Security should focus specifically on
seed phrases, hardware wallets, approval/allowance risks, and
wallet-interaction-specific phishing). Web3 and Testnets remain after
that, followed by resolving the open Graduation question. Bitcoin also
remains open for further expansion toward its full mastery-based size
whenever convenient.
