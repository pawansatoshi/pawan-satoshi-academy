# HANDOFF.md — Complete Engineering Handoff

This document explains the current state of Pawan Satoshi Academy for
a senior engineer or AI picking this up **without access to prior
conversation history**. Read this fully before touching code.

Companion documents: `CONTINUE.md` (exact resume state, structured),
`PROJECT_STATUS.md` (detailed phase/subject tracking), `PHASE_STATUS.md`
(quick phase checklist), `CHANGELOG.md` (technical change log),
`RELEASE_NOTES.md` (plain-language change log), `EMPTY_FOLDERS.md`
(scaffold folders explained).

---

## 1. Architecture Overview

Three components sharing one data layer:

```
Discord (existing server)  <->  Bot (Node.js)  ->  bot/data/academy.db (SQLite)
                                     |
                                     v (planned, not yet built)
                          website/data/*.json (scheduled export)
                                     |
                                     v
                    GitHub Pages Website (static, no backend) - NOT YET BUILT
```

- **Discord** is the learning/discussion/quiz/event layer. Bootstrap
  script (`bot/scripts/bootstrap-server.js`) automates creating/renaming
  the server's categories, channels, roles, and permission overwrites
  from a single source-of-truth file (`bot/src/core/server-map.js`).
  Progressive unlock: new members see only a small "Start Here" set
  until verified.
- **The bot** owns the SQLite database and all business logic. Built
  with Node.js + discord.js v14, ES modules throughout.
- **The website** is planned but not started (Phase 5) — it will be a
  static GitHub Pages site reading pre-exported JSON, never querying
  the bot's live database directly.

Full narrative version: `docs/architecture/overview.md`.

## 2. Repository Structure

```
pawan-satoshi-academy/
├── bot/
│   ├── src/
│   │   ├── core/            config, database, logger, permissions, server-map, discord-sync
│   │   ├── modules/         one folder per feature (see section 4)
│   │   ├── commands/        slash command definitions (event.js, quiz.js, assessment.js, security.js, audit.js)
│   │   ├── events/          Discord gateway event handlers
│   │   └── automation/      scheduler (60s tick loop) + export (empty, not built)
│   ├── scripts/             bootstrap-server.js, deploy-commands.js
│   ├── tests/                5 test files (see section 16)
│   ├── package.json          NO package-lock.json yet — see section 14
│   └── eslint.config.js
├── quizzes/
│   ├── question-banks/      17 populated subject folders, 5 not-yet-created
│   └── schema/               question-schema.json, subject-class-mapping.json
├── academy/                  Phase 3C, empty — lesson Markdown not started
├── certificates/              Phase 3D, empty — cert templates not started
├── website/                   Phase 5, empty — no content
├── docs/                      architecture/, modules/, setup/ (partial), troubleshooting/ (empty)
├── .github/workflows/         test.yml, link-check.yml, deploy-pages.yml
└── [governance files]         README, LICENSE, SECURITY, CONTRIBUTING, CODE_OF_CONDUCT,
                                CHANGELOG, PROJECT_STATUS, PHASE_STATUS, CONTINUE, RELEASE_NOTES,
                                EMPTY_FOLDERS, HANDOFF (this file)
```

## 3. Discord Architecture

Single source of truth: `bot/src/core/server-map.js`. Defines:
- `SERVER_NAME` ("Pawan Satoshi Academy")
- `ROLE_DEFINITIONS`: Admin, Moderator, Mentor, OG, Active, Verified, Member — none ever get Administrator (enforced in code via `assertNoAdministrator()` in `core/permissions.js`, not just convention)
- `CATEGORY_DEFINITIONS`: ~12 categories, ~28-32 visible channels to a verified member (forum-first design — Academy Hub is one forum channel, not one channel per subject, to keep the 22-subject curriculum from overwhelming navigation)
- `LEGACY_CHANNEL_REMAPS`: maps the server's pre-existing `general`/`General` channels into the new structure instead of duplicating them
- `BOT_RECOMMENDED_PERMISSIONS`: the exact permission list to request at bot invite — never Administrator

`bot/scripts/bootstrap-server.js` reads this file, diffs against the
live server, prints a dry-run report, and only applies changes with an
explicit `--confirm` flag. **This script has never been run against a
real Discord server in this project's history** — it's been built and
syntax-checked but not live-tested, since this build environment has
no Discord connectivity.

`core/discord-sync.js` resolves the static server-map definitions to
live Discord snowflake IDs after bootstrap runs, storing them in the
database `config` table (`channel.<key>`, `role.<key>`, `category.<key>`)
— no module ever hardcodes a Discord ID.

## 4. Bot Modules

| Module | Status | Purpose |
|---|---|---|
| `core/*` | Built | config, database, logger, permissions, server-map, discord-sync — foundation every other module depends on |
| `welcome/` | Built | Join message |
| `verification/` | Built | Button-based rule acceptance -> Verified role |
| `roles/` | Built | Default + verified role assignment |
| `events/` | Built | Generic recurring-event engine — meetings, quizzes, challenges, announcements, 100% DB-driven, zero hardcoded schedules |
| `moderation-automod/` | Built | Full security engine: `automod.js`, `antiRaid.js`, `antiSpam.js`, `antiPhishing.js`, `nsfw.js`, `logging.js`, aggregated via `index.js` |
| `quiz-engine/` | Built | `validator.js`, `loader.js`, `shuffle.js` (pure, dependency-free), `randomizer.js`, `index.js` (session engine covering practice/daily/weekly/monthly/chapter/final modes) |
| `progress/` | Built | `curriculum.js` (pure unlock logic), `index.js` (DB-backed wrapper) — gates Chapter Assessment/Final Exam access |
| `xp-leveling/` | Empty | Not started — next major feature track after content phase |
| `certificates/` | Empty | Not started |
| `tickets/` | Empty | Not started |
| `suggestions-polls/` | Empty | Not started |
| `meeting-reminders/` | Empty (superseded) | Functionality lives in `events/` instead — this folder kept empty intentionally in case meeting-specific features (RSVP tracking) are wanted later |
| `ai-helper/` | Empty | Not started — needs Phase 3C lesson content first |
| `settings-admin/` | Empty (partially superseded) | `/security`, `/event`, `/assessment` already provide per-feature admin control |
| `study-groups/` | Empty | Not started |
| `activities/` | Empty | Not started, lowest priority |

## 5. Database / Schema

SQLite via `better-sqlite3`, single connection managed exclusively
through `core/database.js` — **no other file should ever open its own
database connection**. Schema (all tables, `CREATE TABLE IF NOT EXISTS`,
idempotent):

- `config` — key-value store for resolved Discord IDs and runtime settings
- `members` — discord_id, username, xp, level, streak, verified_at
- `audit_log` — every bot-driven action, action name, actor, target, details JSON
- `moderation_events` — security engine events (spam timeouts, phishing blocks, raid actions)
- `recurring_events` — the Event Management module's core table; `event_key`, `event_type`, `recurrence_rule`/`recurrence_day`/`recurrence_time_utc`, `status`, `next_run_at`, `quiz_subject`/`quiz_class`/`quiz_count` (for `event_type='quiz'` rows)
- `quiz_attempts` — one row per answered question, any mode, used for repeat-avoidance and future XP hooks
- `community_quiz_answers` — enforces one-answer-per-member-per-message at the DB constraint level (composite primary key), not just application logic
- `class_completions` — one row per member per PASSED Chapter Assessment/Final Exam; unlimited retries by design (failed attempts aren't tracked, only passes)

No migrations system exists yet — schema changes are additive
(`CREATE TABLE IF NOT EXISTS`) so far. If a future change needs to
alter an existing table, a migration script under `bot/scripts/` will
need to be added (none exists yet).

## 6. Quiz Architecture

```
quizzes/question-banks/<subject>/<file>.json   (data)
        |
validator.js   - rejects malformed AND placeholder-text questions at load time
        |
loader.js      - recursively discovers every JSON file, builds in-memory bank, logs stats/rejections
        |
shuffle.js     - pure option-shuffling (deliberately dependency-free, unlike randomizer.js)
randomizer.js  - mode-specific selection: practice / daily / weekly / monthly / chapter assessment / final exam
        |
quiz-engine/index.js - session orchestration:
   - Practice/optional modes: ephemeral step-through, in-memory session store
   - Chapter/Final (required): same session engine, but checks progress/unlock first,
     and on completion checks pass threshold (Chapter 70%, Final 75%) and calls
     progress.recordChapterPass() if passed
   - Community modes (daily/weekly/monthly): posted to a shared channel via the
     Event Management module, one-answer-per-member enforced at DB level
```

Every wrong answer, every mode, shows: correct answer, explanation,
reference (if any), and a suggested topic to review — per explicit
user requirement ("the goal is learning, not punishment").

Required vs. optional (per user's Quiz System Rules):
- Optional, no progression effect: Practice, Daily, Weekly, Challenge
- Required, gates progression: Chapter Assessment (unlocks next class), Final Examination (required for Graduation Certificate) — both unlimited retries

## 7. Question Bank Structure

Every question must match `quizzes/schema/question-schema.json`:
`id`, `class`, `subject`, `topic`, `difficulty`, `question`, `options[4]`,
`correctAnswer` (0-3 index), `explanation`, `tags[]`, `reference`
(string URL or `null` — never fabricated).

Class assignment is governed by `quizzes/schema/subject-class-mapping.json`
— the single source of truth mapping each of the 22 subjects to its
class (e.g., `bitcoin` -> `class-8`, `blockchain` -> `class-8` too, since
one class can span multiple subjects). **Always check this file before
creating a new subject's content.**

Content generation methodology (established over multiple sessions,
must continue): for any subject with factual/historical/regulatory
content, **web_search to verify before writing** — do not rely on
training-data memory alone for dates, figures, or protocol specifics.
Version/network-dependent facts get explicitly flagged as such in the
question itself (see `base-006` in `base.json` for the worked
example: Base's OP Stack relationship changing in Feb 2026). Debated
topics (energy consumption, "digital gold," DeFi risk) are framed
evenhandedly, never asserting a settled answer where none exists.
DeFi content specifically has zero investment advice or price
speculation — enforced by both manual discipline and an automated
test that scans for forbidden language patterns.

Mastery-based sizing (explicit user rule): no fixed question count per
subject. Small/narrow topics: 40-80. Medium: 80-200. Large (Bitcoin,
Blockchain, Ethereum, DeFi): 300-500+. **Bitcoin is currently
under-target (45 questions)** and flagged for future expansion — this
was a deliberate choice to preserve quality/verification rigor over
rushing to a number within available session time, not an oversight.

## 8. Security Architecture

See `docs/modules/security-engine.md` for full detail. Summary: native
Discord AutoMod (scam keywords, mention spam), custom anti-raid
(join-rate detection, temp verification-level raise, new-account
auto-kick, auto-expiry), custom anti-spam (in-memory rate limiting),
custom anti-phishing (domain blocklist + heuristic patterns,
escalating response), NSFW protection via Discord's native Explicit
Content Filter (no paid image-scanning API), full audit trail (mirrors
native Discord audit log + AutoMod executions into the database and
staff channels). Least-privilege enforced in code: `core/permissions.js`
has a hard `assertNoAdministrator()` check used both at runtime and by
the bootstrap script — Administrator is structurally blocked, not just
avoided by convention.

## 9. Automation Architecture

`automation/scheduler/index.js` — a single 60-second `setInterval` tick
that calls `runDueEvents()` (fires any recurring event whose
`next_run_at` has passed) and `runSecurityMaintenance()` (expires raid
mode, prunes stale in-memory anti-spam state). Deliberately simple —
all actual scheduling intelligence lives in the `recurring_events`
table via `modules/events/`, not in the scheduler file itself.
`automation/export/` (DB -> website JSON) is planned but empty — not
yet built, blocks Phase 5 website work.

## 10. Current Curriculum Progress

**17 of 22 subjects complete, 537 questions total.** See the table in
`CONTINUE.md` for exact per-subject counts, classes, and status flags.
Zero duplicate IDs, zero duplicate question text, zero topic overlap
between any two subjects — verified programmatically via a Python
audit script and permanently encoded as Node test-suite assertions in
`bot/tests/quizEngine.test.js`.

## 11. Remaining Curriculum

18. Wallet Security (class-11) — NEXT
19. Web3 (class-12)
20. Testnets (class-12)
21. Ambassador Programs (class-12)
22. Community Management (class-12)

Plus: unresolved "Graduation" question — see `CONTINUE.md` KNOWN
LIMITATIONS section. Ask the user before building anything under
`class:"graduation"`.

## 12. Remaining Engineering Phases

After the content queue is finished (per explicit standing
instruction, in this order):
1. XP & Leveling
2. Certificates
3. AI Helper
4. Tickets
5. Study Groups
6. Meeting Reminders
7. Activities
8. Suggestions & Polls

Then: Phase 3C (Academy lesson Markdown), Phase 4 (export pipeline),
Phase 5 (website), Phase 6 (AI helper — note this is listed twice
across different planning docs; "AI Helper" as a bot feature and
"Phase 6 AI Helper" as a website-integrated feature may need
reconciling when reached), Phase 7 (growth).

## 13. Environment Variables

See `bot/.env.example` for the full annotated list. Key ones:
- `DISCORD_BOT_TOKEN`, `DISCORD_CLIENT_ID`, `DISCORD_GUILD_ID` — required, no defaults
- `OWNER_DISCORD_ID` — required for Owner-override permission logic to work
- `DATABASE_PATH` — defaults to `./data/academy.db`
- `ROLE_ID_*`, `CHANNEL_ID_*` — **NOT required manually** — populated automatically into the database by `bootstrap-server.js` and `discord-sync.js`, listed in `.env.example` only as documentation/fallback
- `AI_HELPER_MODE` — defaults to `retrieval` (no external API key needed by default)

## 14. Deployment Requirements

**Nothing has been deployed anywhere.** Requirements when you do:
- Node.js 20+
- A Discord Application + Bot created in the Developer Portal (manual, one-time — no API exists to automate this)
- Privileged intents enabled: Guild Members, Message Content (manual toggle in Developer Portal)
- Bot invited with `BOT_RECOMMENDED_PERMISSIONS` from `server-map.js` (never Administrator)
- `npm install` **in an environment with npm registry access** — this build sandbox does not have that access (confirmed via a real, failed `npm install` attempt logged in this session, not assumed)
- `npm run bootstrap:server` (dry run, review, then `-- --confirm`)
- `npm run deploy:commands`
- `npm start`

No `package-lock.json` exists yet in this repo — the first successful
`npm install` (by you or by CI) generates it. CI (`test.yml`) already
references `bot/package-lock.json` as a cache path; this will start
working correctly once the file exists after a real install.

## 15. Mobile / GitHub Codespaces Workflow

Per the project's mobile-first constitution: all setup steps above are
achievable from GitHub Codespaces (has real npm registry access,
unlike this build sandbox) via a mobile browser, or from the GitHub
mobile app for anything not requiring a terminal (editing Markdown
content, reviewing PRs, merging). Content generation (writing new
question bank JSON files) can be done entirely through the GitHub
mobile app's file editor for small edits, or via an AI session with
Codespaces access for anything requiring the validator/test suite to
be run.

## 16. Known Limitations (full list)

See `CONTINUE.md`'s KNOWN LIMITATIONS section for the authoritative,
structured list. Highest-priority ones: Bitcoin content undersized;
Graduation question unresolved; zero end-to-end runtime testing has
ever occurred (no live Discord connection in any build environment
used); no `npm install` has ever succeeded (registry access blocked in
every sandbox used so far, confirmed this session with a real failed
attempt, not assumed); Academy lesson content (Phase 3C) doesn't exist
yet, meaning the "suggested topic to review" text shown after wrong
quiz answers currently points to a forum-thread location, not an
actual populated lesson page.

Test files in `bot/tests/`: 5 total. `recurrence.test.js`,
`quizEngine.test.js`, and `curriculum.test.js` are dependency-free or
depend only on same-repo pure modules and JSON files — these run and
pass for real in any environment. `permissions.test.js` and
`antiPhishing.test.js` require `discord.js`/`better-sqlite3` to be
installed — syntax-verified only in this environment, never executed
end-to-end here.

## 17. Exact Next Implementation Step

Generate `quizzes/question-banks/wallet-security/wallet-security.json`.
Before writing: (a) check `subject-class-mapping.json` for the correct
`class` tag (`class-11`), (b) web_search to verify any factual claims
about wallet types, hardware wallet vendors, or historical
wallet-related exploits, (c) cross-check planned topic names against
both `defi/defi.json` (same class-11) and `cyber-security/cyber-security.json`
(closely related domain) to ensure zero overlap before finalizing, (d)
follow the exact validation/test/documentation-update sequence used
for every prior subject this session (see `CONTINUE.md` EXACT NEXT
STEPS for the full checklist).

---

*This handoff reflects the exact repository state at the moment of
generation. If time has passed since, cross-check `CONTINUE.md` and
`PROJECT_STATUS.md` for anything more recent before trusting this
document over them.*
