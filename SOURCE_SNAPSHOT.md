# Source Snapshot

## Imported historical snapshots

The current implementation baseline was assembled from the project's Phase 0, Phase 1, Phase 2, Phase 3A, and Phase 3B snapshots plus the final handoff snapshot.

The latest handoff snapshot is a superset of the earlier phase archives: every path present in the earlier archives is present in the handoff snapshot. Therefore the handoff snapshot is the canonical code baseline and earlier ZIPs are historical checkpoints, not separate code branches.

## Current verified baseline

- 92 project files in the handoff archive
- 17 populated quiz subjects
- 537 validated questions
- Quiz/assessment/progress engine implemented
- Discord foundation and security engine implemented
- Academy lessons, certificates, website, XP/leveling and AI helper remain incomplete and are tracked in ROADMAP.md and the handoff documentation.

## Important distinction

A repository archive is source material, not proof of live deployment. Discord API integration still requires a bot application/token and a supported runtime. Never commit secrets or database files.
