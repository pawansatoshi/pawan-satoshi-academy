# Pawan Satoshi Academy — Live Discord Deployment

This guide takes the current repository from **code** to the existing Discord server.

## Important distinction

GitHub stores the source. The Discord bot must run continuously somewhere. The recommended free-first runtime is an Oracle Cloud Always Free VM. Oracle currently provides Always Free compute resources that do not expire; eligible resources must stay within the Always Free limits. Oracle's signup may require a credit/debit card for identity verification, but Oracle states the card is not charged unless the account is upgraded. Review the current Oracle Free Tier terms before proceeding.

## 1. Create the Discord application

Open the Discord Developer Portal and create a new Application.

Use a clear name such as:

`Pawan Satoshi Academy`

Then open **Bot** and create/reset the bot token.

Never put the token in GitHub.

Record:

- Application ID / Client ID
- Bot Token

## 2. Enable required privileged intents

In the Developer Portal → Bot → Privileged Gateway Intents, enable:

- Server Members Intent
- Message Content Intent
- Auto Moderation Execution Intent (if shown for the application)

The source code explicitly requests these intents because member onboarding and message-level anti-phishing/anti-spam logic depend on them.

## 3. Invite the bot to the EXISTING server

Use OAuth2 → URL Generator.

Scopes:

- `bot`
- `applications.commands`

Use the least-privilege permissions required by `BOT_RECOMMENDED_PERMISSIONS` in `bot/src/core/server-map.js`.

**Never select Administrator.**

The bot must be invited to the existing Pawan Satoshi Discord server. Do not create a replacement server.

## 4. Obtain the IDs

Enable Discord Developer Mode on your account.

Copy:

- Server ID → `DISCORD_GUILD_ID`
- Application ID → `DISCORD_CLIENT_ID`
- Your own Discord User ID → `OWNER_DISCORD_ID`

## 5. Create the free runtime

Recommended: Oracle Cloud Infrastructure Always Free compute.

Create one Always Free eligible Ubuntu VM in the account's home region.

For the bot, a small Always Free VM is sufficient. Do not provision paid resources.

## 6. Connect from a mobile browser

Use the Oracle Cloud Console's browser-based terminal/Cloud Shell or the VM's SSH connection from the phone.

Clone the repository and run the installer:

```bash
git clone https://github.com/pawansatoshi/pawan-satoshi-academy.git
cd pawan-satoshi-academy
sudo bash deploy/oracle/install.sh
```

The installer asks for the four required Discord values and stores them in:

`/etc/pawan-satoshi-academy.env`

That file is mode `600` and is never committed to GitHub.

## 7. FIRST RUN — DRY RUN ONLY

Before changing Discord:

```bash
sudo pawan-academy bootstrap-dry-run
```

Read the complete output.

The bootstrap implementation is deliberately gated:

- no automatic deletion
- no Administrator permission
- existing third-party bot roles are left alone
- legacy `general`/`General` channels are remapped rather than duplicated
- only the server-map-defined structure is changed

## 8. Apply the Discord structure

Only after reviewing the dry-run:

```bash
sudo pawan-academy bootstrap-apply
```

This creates/renames/moves the Academy structure in the existing server.

## 9. Register slash commands

```bash
sudo pawan-academy deploy-commands
```

Current command families include:

- `/quiz`
- `/assessment`
- `/event`
- `/security`
- `/audit`

## 10. Start the bot

```bash
sudo pawan-academy start
```

Check:

```bash
sudo pawan-academy status
```

and:

```bash
sudo pawan-academy logs
```

## 11. Verify in Discord

Test in this order:

1. Server name/structure
2. `#welcome`
3. `#rules`
4. `#verify`
5. Verification button
6. Verified role assignment
7. `/quiz practice`
8. `/assessment progress`
9. `/security status` (staff)
10. `/audit recent` (staff)
11. Event commands
12. Anti-phishing/anti-spam behavior

Do not test destructive moderation against real members. Use a controlled test account where possible.

## 12. Existing bots

Do NOT immediately remove the five existing third-party bots.

Keep them untouched while the Academy bot is validated. Remove/retire old bots only after their replacement functionality has been tested and the server owner explicitly decides to do so.

## 13. Future updates

After code changes are pushed to `main`:

```bash
sudo pawan-academy update
```

The update helper:

1. stops the bot
2. backs up SQLite
3. resets the working tree to `origin/main`
4. installs dependencies
5. starts the bot again

If a Discord server-structure change is introduced, run a dry-run again before applying it.

## 14. Backup

The SQLite database is stored at:

`bot/data/academy.db`

Before major updates, copy it somewhere outside the repository or use the update helper's timestamped backup.

Never commit the database if it contains private/member data.

## 15. Free-cost rule

The Academy itself remains free to learners. The Oracle Always Free runtime is a hosting option, not a paid requirement. If Oracle's terms or availability change, do not silently switch to a paid provider. Re-evaluate a free alternative first.

## 16. Rollback mindset

Never run `git push --force` for deployment recovery.

Never delete the existing Discord server.

Never run bootstrap with `--confirm` without first reading its dry-run output.

Never expose or paste the bot token into chat, GitHub issues, README files, screenshots, or public logs.
