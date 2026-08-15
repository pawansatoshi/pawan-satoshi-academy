# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in the bot, website, or any
automation in this repository, please report it privately rather than
opening a public issue.

**How to report:**
1. Open a private security advisory via GitHub's "Report a vulnerability"
   feature on this repository (Security tab → Report a vulnerability), or
2. Contact the maintainer directly through the official Discord
   community (https://discord.gg/hvHNpT4xX) via DM to the server Owner.

Please include:
- A description of the vulnerability
- Steps to reproduce
- Potential impact
- Any suggested fix (optional)

**Do not** disclose the vulnerability publicly (Discord, social media,
GitHub issues) until it has been reviewed and, if valid, patched.

## Response

The maintainer will acknowledge reports as soon as practical and work
on a fix. Because this is a community-run, unpaid project, response
time is best-effort rather than SLA-backed — critical issues (auth
bypass, secret leakage, permission escalation) are prioritized first.

## Scope

In scope:
- The Discord bot (`bot/`)
- The GitHub Pages website (`website/`)
- CI/CD workflows (`.github/workflows/`)
- Certificate generation/verification logic

Out of scope:
- Discord platform itself (report to Discord directly)
- Third-party bots not maintained in this repository (TBOOK Bot,
  Captcha.bot, Welcomer, MEE6, Statbot) — report to their own
  maintainers

## Security Principles This Project Follows

- Least privilege for every role, bot, and automated action
- No bot is ever granted the `Administrator` permission
- No secrets are ever committed to the repository
- All secrets are managed via `.env` (local) or GitHub Secrets (CI)
- The server Owner always retains full override control
- Dependencies are reviewed and kept up to date
