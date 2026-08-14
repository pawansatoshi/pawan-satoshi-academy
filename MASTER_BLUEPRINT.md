# Pawan Satoshi Academy — Master Blueprint

## Mission

Build a completely free, beginner-first Web2/Web3/AI learning ecosystem around the existing Pawan Satoshi Discord community, with a static GitHub Pages academy and a secure Discord bot.

## Non-negotiables

- Existing Discord server only: `https://discord.gg/hvHNpT4xX`
- No mandatory paid service for joining, learning, quizzes, certificates, or community access.
- Least-privilege Discord permissions; never grant Administrator to automation roles.
- Owner retains ultimate control.
- No placeholder features or fake integrations.
- Beginner-friendly UX and mobile-first administration.
- Official sources preferred for technical/crypto facts.
- Practice quizzes are optional; Chapter Assessments and Final Examination are required only for progression/certification.

## System

1. **Discord Bot** — onboarding, verification, moderation, events, quizzes, assessments, progress, XP, certificates, tickets, AI helper and community automation.
2. **Academy Content** — Orientation → Class 1 → Class 12 → Graduation, with lessons, labs, assignments and references.
3. **Static Website** — GitHub Pages, mobile-first, course catalogue, resources, community links and free certificate verification using exported public JSON.

## Security

Anti-raid, anti-spam, anti-phishing, anti-scam, NSFW protection, audit logging, secure secret handling, role hierarchy enforcement and owner override.

## Curriculum

Orientation; Internet Basics; Digital Literacy; Cyber Security; Password Safety; Digital Payments; Git & GitHub; Linux; Programming; AI; Prompt Engineering; Bitcoin; Blockchain; Ethereum; Base; Stablecoins; DeFi; Wallet Security; Web3; Testnets; Ambassador Programs; Community Management; Graduation/capstone.

## Engagement

Daily/weekly quizzes, optional challenges, XP, levels, badges, leaderboard, Hall of Fame, suggestions, polls, study groups, Sunday community meeting, free activities where Discord supports them, and beginner-friendly discussions.

## Architecture principle

SQLite is the bot-side source of truth. The website never connects directly to the bot database; public non-sensitive data is exported as static JSON for GitHub Pages.

## Completion definition

The project is not complete until every mandatory feature has a real implementation, tests where applicable, documentation, security review, and a verified deployment path. A scaffolded directory is not considered a completed feature.
