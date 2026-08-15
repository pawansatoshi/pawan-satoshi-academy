# CONTINUE.md — Current Source-of-Truth State

## Current phase

**Final implementation + launch hardening.**

The repository now contains all 22 curriculum subjects, the 637-question validated bank, 14 lesson documents, the Discord application, certificate system, AI helper, community automation and the mobile-first website.

## Completed

- Phase 0 — Planning & scaffold
- Phase 1 — Discord foundation
- Phase 2 — Security engine
- Phase 2 remainder — XP, levels, leaderboard, suggestions and polls
- Phase 3A — Quiz engine, required chapter assessments, final examination and progression gates
- Phase 3B — 22 subject question banks / 637 validated questions
- Phase 3C — 14 lesson documents including graduation synthesis
- Phase 3D — Certificates, persistent registry and public verification API
- Phase 4 — Daily quiz, weekly meeting, tickets, study groups, activities and exports
- Phase 5 — Responsive website + GitHub Pages deployment
- Phase 6 — Retrieval-first `/ask` helper
- Phase 7 — Badges, profile, knowledge game, security checks and launch hardening

## Question bank coverage

All 22 subjects are present and the repository implementation reports **637 validated questions**. The five final subject banks are Wallet Security, Web3, Testnets, Ambassador Programs and Community Management.

## Website

The GitHub Pages site is deployed from `main`. Lesson cards use the dedicated responsive Academy lesson reader, which loads the Markdown lesson corpus from the deployed site rather than navigating to a missing root-level path.

## Runtime deployment

The Discord bot is designed for the existing persistent free-first runtime. The repository requires the normal host deployment to pull the latest `main` commit and then the runtime should be smoke-tested for `/health`, profile, `/ask`, knowledge game, certificates, tickets and scheduled events.

## Security constraints

- Never grant Administrator when the bot's specific permissions are sufficient.
- Never force-push.
- Never automatically delete existing channels, roles or third-party bots.
- Never expose Discord or API secrets.
- Keep persistent database storage configured on the runtime.
