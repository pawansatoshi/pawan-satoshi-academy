# CONTINUE.md — Exact Continuation State (Handoff Snapshot)

Generated at an explicit PAUSE checkpoint for external audit/handoff.
Read this file first in any new session. Also read `HANDOFF.md` for
full architectural context, and `PROJECT_STATUS.md`/`PHASE_STATUS.md`
for detailed phase tracking.

---

## CURRENT PHASE

Phase 3B (Question Bank Content) — IN PROGRESS, paused mid-phase at
17/22 subjects complete. Phase 3A (Quiz Engine) is fully complete.

## COMPLETED PHASES

- Phase 0 — Planning & Scaffold
- Phase 1 — Discord Foundation (core infra, bootstrap-server.js, welcome/verification/roles, Event Management module)
- Phase 2 — Security Engine (permissions, AutoMod, anti-raid, anti-spam, anti-phishing, NSFW protection, logging, audit)
- Phase 3A — Quiz Engine (schema, validator, loader, randomizer, session engine, required Chapter Assessment/Final Examination gating with unlimited retries)

## CURRENT IMPLEMENTED FEATURES

- Server bootstrap automation (dry-run + `--confirm`, never deletes, never touches pre-existing third-party bots, never requests Administrator)
- Welcome, verification (button-based), role assignment (default + verified)
- Full Event Management module: `/event create|edit|postpone|cancel|resume|disable|delete|list`, 100% database-driven recurring events (no hardcoded schedules)
- Full Security Engine: native AutoMod rules, anti-raid (join-rate detection + temp verification-level raise + new-account auto-kick), anti-spam (rate limiting + duplicate-flood detection), anti-phishing (domain blocklist + heuristics, escalating response), NSFW protection (Discord's native Explicit Content Filter), audit logging (mirrors native Discord audit log + AutoMod executions), `/security status`, `/audit recent`
- Quiz Engine: `/quiz practice`, `/quiz stats`, `/assessment chapter|final|progress`, community quiz posting via Event Management integration, mastery-based content validation (rejects placeholder/malformed questions at load time)
- Curriculum progress/unlock system: `modules/progress/` — pure curriculum-order logic + DB-backed member completion tracking, gates Chapter Assessment access sequentially

## COMPLETED SUBJECTS (17 of 22)

| # | Subject | Questions | Class | Status |
|---|---|---|---|---|
| 1 | Orientation | 42 | orientation | ✅ Complete |
| 2 | Internet Basics | 45 | class-1 | ✅ Complete |
| 3 | Digital Literacy | 33 | class-1 | ✅ Complete |
| 4 | Cyber Security | 43 | class-2 | ✅ Complete |
| 5 | Password Safety | 34 | class-2 | ✅ Complete |
| 6 | Digital Payments | 31 | class-3 | ✅ Complete |
| 7 | AI | 30 | class-7 | ✅ Complete |
| 8 | Prompt Engineering | 22 | class-7 | ✅ Complete |
| 9 | Git & GitHub | 35 | class-4 | ✅ Complete |
| 10 | Linux | 30 | class-5 | ✅ Complete |
| 11 | Programming | 28 | class-6 | ✅ Complete |
| 12 | Bitcoin | 45 | class-8 | 🟡 Solid, verified start — BELOW its "large subject" 300-500+ target, needs expansion |
| 13 | Blockchain | 25 | class-8 | ✅ Complete |
| 14 | Ethereum | 28 | class-9 | ✅ Complete |
| 15 | Base | 20 | class-10 | ✅ Complete |
| 16 | Stablecoins | 21 | class-10 | ✅ Complete |
| 17 | DeFi | 25 | class-11 | ✅ Complete |

## NOT YET STARTED (5 of 22 subjects remaining)

18. Wallet Security (class-11)
19. Web3 (class-12)
20. Testnets (class-12)
21. Ambassador Programs (class-12)
22. Community Management (class-12)

Plus: an unresolved open question about whether "Graduation" needs its
own dedicated question set — see KNOWN LIMITATIONS below.

## TOTAL QUESTION COUNT

**537 questions** across 17 populated subject files. Cross-validated
programmatically (not just asserted): zero duplicate IDs, zero
duplicate question text, zero topic overlap between any two subjects,
across the entire 537-question corpus.

## TEST COUNT / PASS STATUS

**64 of 64 real, executable tests passing** (verified in this
environment, this session):
- `tests/recurrence.test.js`: 12/12 passing
- `tests/quizEngine.test.js`: 41/41 passing (validates all 17 real question bank files live, plus pairwise topic-overlap checks, global cross-file uniqueness checks, topic-diversity ratio check, and an investment-advice-language scan on DeFi content)
- `tests/curriculum.test.js`: 11/11 passing

**Not executed in this environment (honest limitation, not a failure)**:
`tests/permissions.test.js` and `tests/antiPhishing.test.js` are
syntax-verified (`node --check` passes) but require `discord.js` and
`better-sqlite3` to be installed to actually run. `npm install` was
attempted in this build sandbox and failed with `403 Forbidden` from
the npm registry — this sandbox has no network/registry access. These
two test files, and the entire bot runtime, have never been executed
end-to-end in this environment. They will run automatically in CI
(`.github/workflows/test.yml`) on push, where GitHub's runners do have
registry access — or locally once you run `npm install` yourself.

**Full syntax check**: all 38 source files in `bot/src/` pass
`node --check` with zero errors. No broken relative imports detected
by static scan.

**No `package-lock.json` exists yet** in this repository — because
`npm install` has never successfully completed in any environment this
project has been built in so far. The first successful `npm install`
(by you, or by CI) will generate it.

## NEXT SUBJECT

**Wallet Security** (class-11, shares a class with the already-completed
DeFi subject — verify zero topic overlap against DeFi before finalizing).
Must also stay explicitly distinct from the general Cyber Security
subject (already complete) — Wallet Security should cover
seed-phrase/private-key handling specifics, hardware vs. software
wallets, token approval/allowance risks, and wallet-interaction-specific
phishing (fake dApp connection requests, malicious signature requests)
— not re-cover Cyber Security's general 2FA/malware/social-engineering
content.

## NEXT FEATURE (after all 22 subjects + Graduation resolved)

Per standing instruction, in this exact order:
1. XP & Leveling
2. Certificates
3. AI Helper
4. Tickets
5. Study Groups
6. Meeting Reminders
7. Activities
8. Suggestions & Polls

Do not start these early — the content queue (5 subjects + Graduation
question) must finish first.

## KNOWN LIMITATIONS

1. **Bitcoin is undersized** relative to its "large subject" target (45 questions vs. 300-500+) — flagged, not hidden. Needs a dedicated future session to expand.
2. **Graduation content is unresolved** — `selectFinalExamQuestions()` in `randomizer.js` already draws comprehensively from class-1 through class-12 (excluding orientation). Unclear whether a dedicated `class:"graduation"` question set (capstone/career-guidance content) is still wanted, or whether the existing Final Exam design already satisfies the requirement. Ask the user before building anything under `class:"graduation"`.
3. **No npm install has ever succeeded** in any build environment used so far — zero runtime execution of the bot has occurred. All verification has been: syntax checking (`node --check`), and real execution of the subset of tests with zero external dependencies. This is disclosed, not hidden, in every session's status files.
4. **Two open questions about pre-existing third-party bots** remain unanswered by the user: what does TBOOK Bot do, and is MEE6 Premium active. Non-blocking — these only matter when the user is ready to retire old bots, which the user has explicitly said will happen manually, after custom-bot replacements are tested.
5. **No manual Discord deployment has occurred.** The bootstrap script, event system, security engine, and quiz engine have never been run against a live Discord server. All correctness confidence comes from static analysis and the dependency-free unit tests.
6. **Academy lesson content (Phase 3C) does not exist.** Only quiz *questions* exist — long-form lesson Markdown that the Academy Hub forum and website are meant to eventually contain has not been started.

## KNOWN EMPTY FOLDERS

See `EMPTY_FOLDERS.md` for the full table with reasoning per folder.
Summary: `bot/src/modules/{xp-leveling,certificates,tickets,suggestions-polls,meeting-reminders,ai-helper,settings-admin,study-groups,activities}/`, `bot/src/automation/export/`, `academy/{orientation,classes,graduation,subjects}/`, `certificates/templates/`, `website/{academy,community,docs,faq,assets,data}/`, `docs/{setup,troubleshooting}/` — all intentional scaffold for future phases, not errors.

## EXACT NEXT STEPS

1. Read `HANDOFF.md` in full before writing any code.
2. Confirm current repo state matches this file (run the audit commands documented in `HANDOFF.md` section 16 if in doubt).
3. Generate `quizzes/question-banks/wallet-security/wallet-security.json` — apply the same methodology as every prior crypto subject: web_search to verify any historical/factual claims, check `quizzes/schema/subject-class-mapping.json` for correct `class` tagging, cross-check topic names against DeFi and Cyber Security before finalizing.
4. Add the new file's path to `ALL_COMPLETED_BANK_PATHS` in `bot/tests/quizEngine.test.js`, plus a per-subject validation test and pairwise overlap tests.
5. Run the full audit sequence (syntax check, real test run, cross-file JSON validation script) before considering the subject done.
6. Update `PROJECT_STATUS.md`, `PHASE_STATUS.md`, `CHANGELOG.md`, `CONTINUE.md`, `RELEASE_NOTES.md`, `EMPTY_FOLDERS.md`.
7. Continue to Web3, Testnets, Ambassador Programs, Community Management in that order.
8. Resolve the Graduation question with the user before building it.
9. Only then begin XP & Leveling.
