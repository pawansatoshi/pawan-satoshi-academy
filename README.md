# Pawan Satoshi Academy

A free, mobile-first Discord learning ecosystem for Web2, Web3, AI, cybersecurity and digital literacy.

## Project status

This repository is being initialized from the verified Pawan Satoshi Academy handoff snapshot. The implementation is modular and designed for administration from Android using GitHub Codespaces and a mobile browser.

### Core principles

- Existing Discord server only: https://discord.gg/hvHNpT4xX
- Free-first: no mandatory paid services
- Least-privilege Discord permissions
- Owner retains ultimate control
- Mobile-first development and administration
- Production-ready code; no placeholder implementations
- Automated validation and documented handoffs

## Current architecture

- `bot/` — Discord bot and automation
- `quizzes/` — validated question banks and schemas
- `academy/` — curriculum content
- `website/` — GitHub Pages application
- `docs/` — architecture and module documentation
- `.github/` — CI/CD workflows

## Important

GitHub stores the source code; the Discord bot still requires a supported runtime to remain online. Never put a Discord token in the repository. Use environment variables or GitHub/Codespaces secrets.

See `HANDOFF.md` and `CONTINUE.md` for the verified implementation state and exact next steps.
