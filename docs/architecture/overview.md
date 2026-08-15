# Architecture Overview

## System Shape

Three parts, one shared data layer:

```
Discord (existing server)  ←→  Bot (Node.js)  →  data/academy.db (SQLite)
                                     │
                                     ▼ (scheduled export, public data only)
                          website/data/*.json
                                     │
                                     ▼
                    GitHub Pages Website (static, no backend)
```

- **Discord** is the learning/discussion/quiz/event layer — kept
  intentionally lightweight (25–35 visible channels, forum channels,
  progressive unlocking, an AI guide) so it feels like a modern
  learning platform, not a folder tree.
- **The website** is the library — long-form lessons, documentation,
  and certificate verification. It has zero server-side code, which is
  what keeps GitHub Pages hosting free: it reads pre-exported JSON
  rather than querying a live database.
- **The bot** is the engine connecting both — it owns the database,
  runs automations, and periodically exports the public subset of that
  data for the website to consume.

## Why This Split (Design Rationale)

Discord is good at real-time interaction but bad at long-form content
discovery on mobile — pushing 22 subjects worth of lessons into Discord
channels would either overwhelm new members or require dozens of
channels. GitHub Pages is good at structured, searchable, linkable
long-form content but has no live backend on the free tier. Splitting
along those strengths — Discord for *doing*, website for *reading* —
lets both stay simple and free.

## Discord Design Principles (per approved server map)

1. **Progressive unlock**: new members see only a small "Start Here"
   set of channels until verified; the rest of the server (including
   Academy) unlocks after verification.
2. **Forum channels over flat channels**: subject-level content lives
   as forum threads inside a small number of forum channels (e.g. one
   Academy Hub forum) rather than one text channel per subject —
   this is what keeps the visible channel count in the 25–35 range
   despite a 22-subject curriculum.
3. **One Academy Hub**: Discord doesn't host full lessons — it hosts
   discussion threads, quizzes, and links out to the matching website
   lesson page. The website is the source of truth for lesson content.
4. **Dynamic UI over channel sprawl**: slash commands, buttons, select
   menus, embeds, and progress cards do the work that would otherwise
   require many separate channels or roles.
5. **AI-guided onboarding**: a member typing something like "I am new"
   is recognized by the `ai-helper` module and walked through
   Orientation step by step, rather than being expected to self-navigate
   a channel list.

## Bot Module Boundaries

Each module in `bot/src/modules/` owns its own:
- Discord event/command handlers
- Database tables (via `core/database` repositories)
- Documentation page in `docs/modules/`

Modules never reach into each other's database tables directly — they
go through `core/database` repository interfaces. This keeps modules
independently testable and replaceable, which matters here specifically
because five modules (`welcome`, `verification`, `xp-leveling`,
parts of `moderation-automod`) are designed to eventually **replace**
existing third-party bots (Welcomer, Captcha.bot, MEE6, Statbot) —
they need to be swappable without touching unrelated code.

## Data Model (high level, detailed schema in Phase 1)

- `members` — Discord ID, XP, level, role tier, join date, streaks
- `progress` — per-member, per-class completion status
- `quiz_attempts` — scores, timestamps, question set used
- `certificates` — unique ID, level, issue date, member reference
- `tickets` — support ticket history
- `config` — guild-specific runtime settings (Owner-editable via
  `/setup`)

## Security Boundaries

- Bot process only ever holds the permissions listed in the approved
  permission matrix (`docs/architecture/permission-matrix.md`, added
  in Phase 1) — never `Administrator`.
- `core/permissions` is the single choke point every privileged action
  passes through, so the "Owner can always override" rule is enforced
  in one place, not re-implemented per module.
- The database file (`bot/data/academy.db`) is never committed
  (`.gitignore`) and never exposed to the website directly — only the
  scheduled, filtered JSON export is public.

## What's NOT in This Repo

- The five pre-existing third-party bots (TBOOK Bot, Captcha.bot,
  Welcomer, MEE6, Statbot) — they remain configured directly in
  Discord until retired, and are out of this repository's scope by
  design.
- Any paid service integration — if one is ever added, it must be
  strictly optional per the cost policy in `PROJECT_CONSTITUTION.md`.

## Related Documents

- Server map, role hierarchy, and permission matrix — approved
  separately, formalized into `docs/architecture/permission-matrix.md`
  and `docs/architecture/server-map.md` in Phase 1.
- Curriculum mapping — `academy/README.md` (added in Phase 3).
