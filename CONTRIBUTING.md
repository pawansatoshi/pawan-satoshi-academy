# Contributing to Pawan Satoshi Academy

Thank you for wanting to help build a free learning ecosystem. This
guide covers how to contribute from a phone (Android + GitHub app +
mobile browser) or a computer — both are fully supported.

## Ways to Contribute

- **Lessons**: Add or improve Markdown content in `academy/`
- **Quiz questions**: Add to `quizzes/question-banks/`
- **Bot features**: Work in `bot/src/modules/`
- **Website**: Improve `website/`
- **Documentation**: Improve anything in `docs/`
- **Bug reports**: Open a GitHub Issue
- **Translations**: (future) multi-language support is on the roadmap

## Ground Rules

1. **Free forever** — never introduce a feature that requires payment
   to use.
2. **No secrets in commits** — use `.env` locally, GitHub Secrets in CI.
   If you accidentally commit a secret, report it immediately (see
   `SECURITY.md`) and rotate it.
3. **Beginner-friendly** — write for someone new to the topic. Avoid
   unexplained jargon.
4. **Follow existing module structure** — new bot features go in
   `bot/src/modules/<feature-name>/`, not scattered across the codebase.
5. **Document what you build** — every new feature needs a short doc in
   `docs/modules/` covering purpose, setup, configuration, and
   troubleshooting.
6. **No placeholder code** — pull requests with `TODO`, stub functions,
   or fake data will not be merged as-is.

## Contributing From Android (Mobile-Only Workflow)

1. Install the **GitHub app** (Play Store).
2. Fork the repository from the app or mobile browser.
3. For small edits (Markdown lessons, docs, quiz questions): use the
   GitHub app's built-in file editor directly — no local setup needed.
4. For code changes: use a mobile-friendly cloud IDE (e.g., GitHub
   Codespaces via mobile browser, if you have free-tier access) or
   describe the change in an Issue for someone with a computer to pick
   up.
5. Open a Pull Request from the app or mobile browser — the description
   template will guide you through what to include.

## Contributing From a Computer

```bash
git clone https://github.com/pawansatoshi/pawan-satoshi-academy.git
cd pawan-satoshi-academy/bot
npm install
cp .env.example .env   # fill in your own test bot token, never commit it
npm run dev
```

Run tests before opening a PR:

```bash
npm test
npm run lint
```

## Pull Request Process

1. Branch from `develop`, not `main` (see branch strategy below).
2. Keep PRs focused — one feature or fix per PR.
3. Update relevant documentation in the same PR.
4. Update `CHANGELOG.md` under "Unreleased".
5. A maintainer will review before merge; `main` is protected.

## Branch Strategy

- `main` — stable, deployed
- `develop` — active integration branch
- `feature/<name>` — new features
- `hotfix/<name>` — urgent fixes to `main`

## Code of Conduct

By participating, you agree to follow our
[Code of Conduct](CODE_OF_CONDUCT.md).
