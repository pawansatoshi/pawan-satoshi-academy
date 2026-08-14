# Mobile Bootstrap

This repository is designed for Android + mobile browser + GitHub Codespaces. No desktop-only workflow is required.

## One-time handoff import

The verified handoff snapshot is the current implementation baseline. GitHub's repository connector cannot directly ingest a local conversation ZIP as a directory, so the repository includes a safe importer.

1. Open GitHub Codespaces for this repository.
2. Upload the handoff ZIP to the repository root.
3. Run:

```bash
bash scripts/import-handoff.sh ./pawan-satoshi-academy-HANDOFF-snapshot.zip
```

4. Review the changed files.
5. Run the bot tests from `bot/`:

```bash
cd bot
npm install
npm test
```

6. Commit and push.

The importer removes local `.env` files and database files from the archive and appends safe local-state patterns to `.gitignore`.

## Important

The Discord bot token must never be committed. Put secrets in Codespaces secrets/environment variables or another supported secret store.

The GitHub repository stores and tests the source code. A separate supported runtime is still required to keep the Discord bot continuously online.
