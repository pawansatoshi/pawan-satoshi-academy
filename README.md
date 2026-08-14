# Pawan Satoshi Academy

A free, mobile-first Discord learning ecosystem for Web2, Web3, AI, cybersecurity and digital literacy.

## Mission

Transform the existing Pawan Satoshi Discord community into a safe, beginner-friendly Academy from Orientation through Class 12 and Graduation, with free quizzes, assessments, certificates, community activities and a public learning website.

## Non-negotiables

- Existing Discord server only: https://discord.gg/hvHNpT4xX
- Learning, quizzes and certificates remain free.
- Least-privilege permissions; no unnecessary Administrator access.
- Owner retains ultimate control.
- No placeholder implementations.
- Official documentation is preferred for technical and crypto facts.
- Mobile-first administration.

## Current architecture

- `bot/` — Discord bot and automation
- `quizzes/` — validated question banks and schemas
- `academy/` — long-form curriculum content
- `certificates/` — certificate generation assets
- `website/` — GitHub Pages application
- `docs/` — architecture, setup and module documentation
- `.github/` — CI/CD workflows

## Roadmap

Read [`MASTER_BLUEPRINT.md`](MASTER_BLUEPRINT.md) for the product definition and [`ROADMAP.md`](ROADMAP.md) for the authoritative execution order.

`SOURCE_SNAPSHOT.md` records the historical ZIP checkpoints and the canonical handoff baseline.

## Current baseline

The latest verified handoff contains 17 populated subjects and 537 validated quiz questions, plus the Discord foundation, security engine, quiz engine, assessment engine and curriculum progress tracking. The remaining product modules are explicitly tracked in the roadmap and status documents.

## Mobile workflow

The project is designed so the administrator can manage the repository from an Android phone using GitHub's web/mobile interfaces. A desktop PC or Codespace is not a project requirement.

## Security

Never commit Discord tokens, API keys, `.env` files or local databases. Use a supported secret store/environment for deployment.

## Important deployment note

GitHub stores the source code and can host the static website. The Discord bot still needs a supported runtime to remain continuously online; repository storage alone does not run a Discord bot.
