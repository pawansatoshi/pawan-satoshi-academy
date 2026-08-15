# Academy Product Operations

## Learner commands

- `/quiz practice` — optional subject practice
- `/quiz stats` — lifetime quiz accuracy
- `/assessment chapter` — required chapter assessment
- `/assessment final` — required final examination
- `/assessment progress` — curriculum progression
- `/profile` — XP, streak, accuracy and badges
- `/leaderboard` — top XP learners
- `/ask` — retrieval-first helper over the Academy lesson corpus
- `/game knowledge` — short educational mini-game
- `/certificate status` — eligibility
- `/certificate issue` — issue PDF after graduation
- `/certificate verify id:<id>` — verify a certificate

## Community operations

- `/community ticket-open` — private support channel
- `/community ticket-close` — close own ticket or moderator ticket
- `/community ticket-list` — personal ticket history
- `/community group-create` / `group-list` / `group-join` — study groups
- `/community activity` — interactive poll/activity
- `/community export` — management export
- `/suggest add` / `list` / `status` — suggestion workflow

## Automation

On startup, the bot seeds missing defaults only:

- Daily optional quiz at the configured IST hour (default 09:00)
- Weekly Academy meeting at the configured day/hour (default Sunday 19:00 IST)

All recurring events are persisted in SQLite and can be edited, disabled, resumed, postponed or removed through the existing event-management command set.

## Certificate API

The bot HTTP service exposes:

- `GET /verify/certificate/:id`
- `GET /certificate/:id.pdf`
- `GET /health`

Certificate records are persisted in the existing SQLite-backed feature store and PDFs are generated on demand, so the runtime does not depend on an ephemeral certificate-file directory.

## Website

The static website is in `website/` and lessons are copied into the Pages artifact. The Pages workflow deploys automatically from `main`. The certificate verification form accepts the public runtime API URL because GitHub Pages cannot proxy the Discord bot runtime itself.

## Security

The bot does not request Administrator. Ticket channels grant access to the ticket owner and the configured Moderator role. Exports require Manage Guild. Secrets remain environment-only.
