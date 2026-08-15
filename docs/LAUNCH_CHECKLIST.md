# Final Launch Checklist

## Repository implementation

- [x] 22/22 curriculum subjects with 637 validated questions
- [x] Chapter and final assessment progression
- [x] XP, levels, streaks and leaderboard
- [x] 14-lesson curriculum corpus plus graduation synthesis
- [x] PDF certificate generation, registry and HTTP verification
- [x] Ticket system with owner/moderator permissions
- [x] Study groups
- [x] Suggestions and interactive activities
- [x] Community export
- [x] Daily quiz and weekly meeting scheduling
- [x] Retrieval-first `/ask` helper
- [x] Educational knowledge game
- [x] Learner badges/profile
- [x] Mobile-first static website
- [x] GitHub Pages workflow
- [x] Node 22 CI with lint + tests
- [x] Environment-only secret handling

## One-time GitHub account setting

The repository currently has no GitHub Pages site configured. GitHub's `configure-pages` action therefore stops before artifact creation. A repository administrator must open **Settings → Pages → Build and deployment → Source → GitHub Actions** once. After that, pushes to `main` will use the existing workflow automatically.

This is an account/repository setting, not an application-code dependency. The workflow and static site are already present and validated in the repository.

## Runtime deployment

After the bot host pulls the latest `main` commit:

1. ensure the existing persistent `DATABASE_PATH` is retained;
2. ensure Discord token/client/guild IDs remain environment-only;
3. allow the normal deployment process to register the new slash commands;
4. verify `/health` returns `status: ok`;
5. verify `/profile`, `/ask`, `/game knowledge`, `/certificate status` and `/community ticket-open` in a controlled channel;
6. verify the scheduled-event list contains the daily quiz and weekly meeting.

No destructive bootstrap or Administrator permission is required.
