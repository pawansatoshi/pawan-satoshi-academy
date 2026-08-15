# Phase Status

## Final implementation status

| Phase | Description | Status |
|---|---|---|
| 0 | Planning & Scaffold | ✅ COMPLETE |
| 1 | Discord Foundation | ✅ COMPLETE |
| 2 | Security Engine | ✅ COMPLETE |
| 2 remainder | XP, levels, leaderboard, suggestions, polls | ✅ COMPLETE |
| 3A | Quiz Engine + required assessments | ✅ COMPLETE |
| 3B | Question Bank Content | ✅ COMPLETE — 22/22 subjects, 637 questions |
| 3C | Academy Lesson Content | ✅ COMPLETE — 14 Markdown lessons including graduation synthesis |
| 3D | Certificate Generation | ✅ COMPLETE — PDF, persistent registry, `/certificate`, public verification API |
| 4 | Community Operations & Automation | ✅ COMPLETE — tickets, study groups, meetings, activities, exports, daily quiz |
| 5 | Website | ✅ IMPLEMENTED — mobile-first static site + GitHub Pages workflow |
| 6 | AI Helper | ✅ COMPLETE — retrieval-first `/ask` over the lesson corpus |
| 7 | Growth / Engagement / Launch Hardening | ✅ COMPLETE — badges, profile, knowledge game, security/permission checklist and CI |
| 8 | Global Localization Foundation | 🟡 ROADMAP — locale architecture, RTL, translation resources and validation |
| 9 | Multilingual Curriculum | 🟡 ROADMAP — professionally reviewed language packs and localized assessments |
| 10 | Dynamic Voice Learning | 🟡 ROADMAP — browser/device voice discovery, controls and optional TTS adapter |
| 11 | Interactive Classroom | 🟡 ROADMAP — guided learning loop, checkpoints, practical labs and resume state |
| 12 | Web Assessment & Unified Progress | 🟡 ROADMAP — website assessments/progression aligned with Discord |
| 13 | Advanced Web3 Professional Track | 🟡 ROADMAP — wallet, DeFi, bridge, mint, coding, AI, content and community skills |
| 14 | Global Capstone & Graduation | 🟡 ROADMAP — multilingual practical final assessment and graduation |
| 15 | Global Scale & Quality | 🟡 ROADMAP — translation/voice coverage, accessibility, performance and source audits |

## Global product direction

The next generation of the Academy is intentionally designed as a global school rather than an English-only documentation site. The language architecture must support any Unicode language, including RTL languages, while published locales are marked complete only after the real learner path has been tested.

Voice learning is a progressive enhancement: the website should dynamically use voices available on the learner's device/browser, provide play/pause/stop and rate controls, and remain fully usable without audio. External TTS/translation providers are optional adapters and must never become a mandatory dependency for core learning.

The interactive classroom model is:

`Warm-up → Explain → Example → Visual/Scenario → Guided Practice → Knowledge Check → Reflection → Assessment`

Classes remain progressively harder from Class 1 to Class 12. Each class targets seven chapters, with safe practical tasks and required assessments governing progression.

## Validation

- GitHub Actions **Lint & Test run #86 passed successfully** on the prior product implementation commit.
- Node 22 CI runs the real repository lint and test suite.
- Product feature tests cover the educational game and lesson retrieval helper.
- The repository contains a final launch checklist for runtime verification.
- Global-learning phases must add their own unit/integration/accessibility validation before being marked complete.

## Deployment note

The application implementation is complete for the original launch scope. GitHub Pages itself must be activated for the repository by an administrator/maintainer when required: **Settings → Pages → Source → GitHub Actions**. The workflow is already present and will deploy the static site after that repository-level setting is enabled.

The Discord bot's existing host remains the runtime deployment surface. The code is designed for the existing persistent SQLite deployment and least-privilege Discord configuration.

## Security posture

- No tokens or API keys are committed.
- Bot Administrator permission is not required.
- Ticket access is restricted to the ticket owner and configured Moderator role.
- Community exports require Manage Guild.
- Suggestion status changes require Manage Guild.
- Certificate PDFs are generated on demand rather than stored as unprotected ephemeral files.
- Testnet/learning content is educational and does not promise financial outcomes.
- Future translation/TTS providers must not receive secrets or unnecessary learner data.
