# Empty Folders Tracker

Every directory below exists as intentional scaffold from the project
architecture (docs/architecture/overview.md) but has no content yet.
None of these are accidental — each is scoped to a specific future
phase. This file exists so an empty folder is never mistaken for
missing/broken work, and so nothing gets forgotten.

## Bot modules (scaffolded in Phase 0, not yet implemented)

| Folder | Planned in | Depends on |
|---|---|---|
| `bot/src/modules/xp-leveling/` | Phase 2 remainder | Nothing — unblocked, next up after content generation pauses |
| `bot/src/modules/certificates/` | Phase 3D | Question banks + chapter/final assessment engine (✅ done) + XP for badges |
| `bot/src/modules/tickets/` | Phase 4 | Nothing — unblocked |
| `bot/src/modules/suggestions-polls/` | Phase 2 remainder | Nothing — unblocked |
| `bot/src/modules/meeting-reminders/` | — | **Superseded**: this functionality now lives in the generic Event Management module (`modules/events/`) built in Phase 1, which handles meetings as one of several recurring event types. This folder is kept empty intentionally rather than deleted, in case a meeting-specific feature (e.g. RSVP tracking) needs dedicated code later. |
| `bot/src/modules/ai-helper/` | Phase 6 | Academy lesson content (Phase 3C) — the AI helper needs real content to guide members through |
| `bot/src/modules/settings-admin/` | Ongoing | Partially superseded — `/security`, `/event`, `/assessment` already provide admin control per-feature. A unified `/setup` settings command may still be built here if a single-entry-point config UI is wanted. |
| `bot/src/modules/study-groups/` | Phase 4/5 | Nothing — unblocked |
| `bot/src/modules/activities/` | Phase 7 | Discord Activities API integration — lowest priority, free-tier games |
| `bot/src/automation/export/` | Phase 4 | Certificate + leaderboard data to export — needs certificates and XP built first |

## Academy content (Phase 3C, not started)

| Folder | Notes |
|---|---|
| `academy/orientation/` | Long-form lesson Markdown (distinct from quiz questions, which already exist for Orientation) |
| `academy/classes/` | Class 1-12 lesson content |
| `academy/graduation/` | Capstone + career guidance long-form content |
| `academy/subjects/` | Reference material backing the Academy Hub forum threads |

## Certificates (Phase 3D, not started)

| Folder | Notes |
|---|---|
| `certificates/templates/` | PDF template assets — depends on the certificate generation module |

## Website (Phase 5, not started)

| Folder | Notes |
|---|---|
| `website/academy/` | Course catalog pages, generated from `academy/` Markdown |
| `website/community/` | Discord/socials links page |
| `website/docs/` | Rendered documentation |
| `website/faq/` | FAQ page |
| `website/assets/` | Images, CSS, shared static assets |
| `website/data/` | Scheduled JSON export target (leaderboard, certificate registry) — needs `automation/export` first |

## Docs (ongoing)

| Folder | Notes |
|---|---|
| `docs/setup/` | `quickstart.md` referenced in root README but not yet written — should be written alongside the first real deployment attempt, so it's accurate rather than speculative |
| `docs/troubleshooting/` | Populated reactively as real issues are found during setup/testing, rather than pre-written speculatively |

## Not actually empty (verify before assuming)

17 of 22 subject folders under `quizzes/question-banks/` are now populated with real, validated content (537 questions total — see PROJECT_STATUS.md for the per-subject breakdown). The remaining 5 subject folders (Wallet Security, Web3, Testnets, Ambassador Programs, Community Management) will be created as each is completed, following the priority order in `PROJECT_STATUS.md`. Any of these folders that don't yet exist are simply "not started," not missing/broken. Note: Bitcoin's folder is populated but its content is flagged as incomplete relative to its "large subject" mastery-based target — see PROJECT_STATUS.md.

## Maintenance

This file should be updated every time a folder listed above receives its first real content — move it out of this file, or mark it done, in the same commit/session that populates it.
