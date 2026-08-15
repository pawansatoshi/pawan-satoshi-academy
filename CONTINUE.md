# CONTINUE.md — Current Source-of-Truth State

## Current phase

**Phase 3B — Question Bank Content: 17/22 subjects complete.**

The repository is also **deployment-ready for the currently implemented Discord functionality**. Live Discord bootstrap has not yet been run.

## Completed

- Phase 0 — Planning & scaffold
- Phase 1 — Discord foundation
- Phase 2 — Security engine
- Phase 3A — Quiz engine
- Required Chapter Assessment / Final Examination + progress gating
- 17 subject question banks / 537 questions
- Automated duplicate-ID, duplicate-text and topic-separation checks
- GitHub CI validation

## Current CI proof

Latest GitHub Actions validation completed successfully:

**86/86 tests passing + lint passing.**

CI also installs the real npm dependencies successfully on GitHub runners.

## Completed subjects

1. Orientation — 42
2. Internet Basics — 45
3. Digital Literacy — 33
4. Cyber Security — 43
5. Password Safety — 34
6. Digital Payments — 31
7. AI — 30
8. Prompt Engineering — 22
9. Git & GitHub — 35
10. Linux — 30
11. Programming — 28
12. Bitcoin — 45 (solid start; expand later)
13. Blockchain — 25
14. Ethereum — 28
15. Base — 20
16. Stablecoins — 21
17. DeFi — 25

Total: **537 questions**.

## Remaining subjects

18. Wallet Security
19. Web3
20. Testnets
21. Ambassador Programs
22. Community Management

Graduation remains a final-exam/certificate decision rather than a separate numbered subject unless the master blueprint later requires a dedicated graduation bank.

## Live Discord deployment state

**Not yet deployed to the real server.**

Repository now includes:

- `docs/DISCORD_LIVE_DEPLOYMENT.md`
- `deploy/oracle/install.sh`

The intended first live sequence is:

1. Discord Developer Portal bot creation
2. Enable required privileged intents
3. Invite bot to the existing server
4. Provision a persistent free-first runtime
5. Configure secrets outside Git
6. Run bootstrap dry-run
7. Review
8. Run bootstrap with `--confirm`
9. Deploy slash commands
10. Start bot
11. Smoke-test verification, quizzes, assessments, security and events

## Security constraints

- Never grant Administrator.
- Never force-push.
- Never automatically delete existing channels/roles/bots.
- Never expose the Discord token.
- Keep existing third-party bots untouched until replacements are validated.
- Always review the bootstrap dry-run before applying changes.

## Next engineering task after live smoke test

Continue Wallet Security question bank, keeping it distinct from Cyber Security and DeFi.

After all 22 subjects are complete:

1. Academy lessons
2. XP / levels / leaderboard
3. Certificates
4. Tickets / study groups / activities / polls
5. AI Helper
6. Website / GitHub Pages
7. Games and engagement features
8. Final production hardening
9. Full Discord launch
