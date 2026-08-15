# Class 4 — Git & GitHub

## Objectives
Use version control to create traceable changes, review work and collaborate safely.

## Git model
Git records snapshots of a repository. A working tree contains current files, the index stages selected changes, and commits record a coherent change with metadata. Branches provide movable references to commits and make parallel work manageable.

Good commits are small enough to review and explain one purpose. Before committing, inspect the diff, run tests and avoid secrets. `.env`, tokens, private keys and generated credentials should never enter version control.

## GitHub workflow
Pull requests provide a review boundary. Review changed files, security implications, tests and documentation rather than only whether the code appears to work. Protected branches and CI reduce the chance of merging broken changes.

## Recovery
Git can restore earlier commits, but destructive history rewriting should be used carefully on shared branches. Prefer additive corrective commits when others may already have pulled the branch.

## Self-check
What is the difference between staging and committing? Why should secrets never be committed? What does a pull request add beyond a raw commit?
