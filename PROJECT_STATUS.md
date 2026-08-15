# Project Status

Last updated: final product implementation + CI validation + launch hardening.

## Phase Progress

| Phase | Status | Summary |
|---|---|---|
| 0 — Planning & Scaffold | ✅ Complete | Repo structure, governance and CI |
| 1 — Discord Foundation | ✅ Complete | Core infra, bootstrap, welcome, verification, roles, Event Management |
| 2 — Security Engine | ✅ Complete | Permissions, AutoMod, anti-raid, anti-spam, anti-phishing, NSFW, logging, audit |
| 2 remainder — XP/Leaderboard/Suggestions | ✅ Complete | XP, levels, streaks, leaderboard, suggestions and polls |
| 3A — Quiz Engine | ✅ Complete | Schema, validator, loader, randomizer, sessions and assessment integration |
| 3A-ext — Required Assessments & Progress | ✅ Complete | Chapter unlocks, final exam and graduation gate |
| 3B — Question Bank Content | ✅ Complete | 22/22 subjects, 637 validated questions |
| 3C — Academy Lesson Content | ✅ Complete | 14 lesson Markdown files including graduation synthesis |
| 3D — Certificates | ✅ Complete | PDF generation, unique IDs, persistent registry and public verification API |
| 4 — Automation & Community Operations | ✅ Complete | Daily quiz, weekly meeting, tickets, study groups, activities and exports |
| 5 — Website | ✅ Implemented | Mobile-first static application + GitHub Pages workflow |
| 6 — AI Helper | ✅ Complete | Retrieval-first `/ask` over Academy lesson corpus |
| 7 — Growth & Launch Hardening | ✅ Complete | Badges, profile, knowledge game, permissions and final launch checklist |
| Live Discord | 🟡 Existing runtime + new code ready | Existing deployment was previously confirmed healthy; latest product commits require the normal host redeploy/smoke test |

## Content

**637 validated questions across all 22 subjects.**

The lesson corpus now covers Orientation, Classes 1–12 and Graduation. It is the source corpus for the retrieval-first helper and website learning layer.

## Learner features

- Practice, Daily, Weekly and Monthly quizzes
- Required Chapter Assessments at 70%
- Required Final Examination at 75%
- XP: 10 correct / 2 attempted incorrect
- 100 XP per level
- Persisted activity streaks
- `/leaderboard`
- `/profile` and achievement badges
- `/game knowledge`
- `/ask`
- Graduation PDF certificate and verification

## Community features

- Private support tickets with Moderator access
- Study groups
- Suggestions with manager status workflow
- Interactive community activities/polls
- Manager-only JSON export
- Recurring daily quiz and weekly Academy meeting

## Website

The `website/` application is responsive and mobile-first. The GitHub Pages workflow copies the static application and lesson corpus into the Pages artifact.

**Repository-level Pages activation is the only external switch:** an administrator must select **Settings → Pages → Source → GitHub Actions** once. The repository currently has no Pages site configured, so GitHub's `configure-pages` action cannot proceed until that setting is enabled.

## CI

The latest GitHub Actions Lint & Test run for the implementation passed successfully. The final launch checklist is in `docs/LAUNCH_CHECKLIST.md`.

## Security

- Secrets remain environment-only.
- No Administrator permission is required.
- Ticket and management actions enforce least-privilege checks.
- Certificate PDFs are generated on demand.
- Existing third-party Discord bots are not removed or modified by bootstrap code.
