# Phase Status

This is the focused phase-tracker for Pawan Satoshi Academy.

## Phase Checklist

| Phase | Description | Status |
|---|---|---|
| 0 | Planning & Scaffold | ✅ COMPLETE |
| 1 | Discord Foundation (core infra, bootstrap, welcome/verification, roles, Event Management) | ✅ COMPLETE |
| 2 | Security Engine (permissions, AutoMod, anti-raid, anti-spam, anti-phishing, NSFW, logging, audit) | ✅ COMPLETE |
| 2 (remainder) | XP & Leveling, Suggestions & Polls | ⬜ PENDING |
| 3A | Quiz Engine (schema, validator, loader, randomizer, session engine, Chapter/Final assessment gating) | ✅ COMPLETE |
| 3B | Question Bank Content | ✅ COMPLETE — 22/22 subjects, 637 questions |
| 3C | Academy Lesson Content (long-form Markdown for website) | ⬜ PENDING |
| 3D | Certificate Generation | ⬜ PENDING |
| 4 | Ticket System, Study Groups, Meeting Reminders, Activities, DB→website export pipeline | ⬜ PENDING |
| 5 | Website (mobile-first GitHub Pages) | ⬜ PENDING |
| 6 | AI Helper (retrieval-first) | ⬜ PENDING |
| 7 | Growth / engagement / launch hardening | ⬜ PENDING |

## Live deployment

The Discord server bootstrap has now been applied successfully and the bot is running on the live server. The live logs confirmed all 7 mapped roles and all 32 mapped channels were created and synchronized.

The bot also starts the event scheduler with a 60-second tick and now seeds a `daily-community-quiz` event automatically on first startup when `#quiz-arena` exists. The daily quiz time is configurable with `DAILY_QUIZ_HOUR_IST` (default 09:00 IST) and the number of questions with `DAILY_QUIZ_COUNT` (default 1).

## Immediate engineering queue

1. XP / levels / leaderboard and quiz XP rewards
2. Suggestions and polls
3. Academy lesson corpus
4. Certificate generation + public verification
5. Tickets / study groups / reminders / activities / export
6. Website
7. Retrieval-first AI helper
8. Engagement, security, dependency, permission and mobile audits

## Working rule

A phase is complete only when implementation, tests, documentation and deployment instructions are present. Do not mark scaffolding as implemented.
