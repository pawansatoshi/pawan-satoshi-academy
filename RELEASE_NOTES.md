# Release Notes

Plain-language summary of what's actually working right now — written
for you (Pawan), not for developers. See `CHANGELOG.md` for the
technical version and `PROJECT_STATUS.md` for the phase-by-phase plan.

---

## v0.3.7 — DeFi

Fifth crypto subject: **DeFi** (25 questions). Given your explicit
rule against investment advice, this one sticks strictly to mechanism
and risk — how AMMs and liquidity pools work, impermanent loss,
over-collateralized lending, smart contract risk, oracle manipulation,
rug pulls, and two real historical exploits (Poly Network and Ronin,
each roughly $600M+) as concrete case studies. No protocol is
recommended or discouraged anywhere. I also added a permanent
automated test that scans every DeFi question for investment-advice
language patterns, so this isn't just a one-time manual check.

537 questions across 17 subjects now.

## v0.3.6 — Ethereum, Base, Stablecoins

Three more subjects, all held to the same verify-before-writing
standard as Bitcoin:

- **Ethereum** (28 questions): its own history, the Merge, smart
  contracts specifically on Ethereum, gas fees, and — importantly —
  the fact that ETH has no fixed supply cap like Bitcoin does. Kept
  clearly separate from the general concepts already covered in
  Blockchain.
- **Base** (20 questions): Coinbase's Layer 2 network. I included a
  question specifically about how Base's technical relationship with
  Optimism's OP Stack changed as recently as February 2026 — using it
  as a deliberate example of flagging facts that can change, rather
  than pretending a 2023 launch-era description is still exactly
  accurate today. Also included real scam-awareness content: Base has
  no official token, so any "Base token" you see offered elsewhere is
  almost certainly fake.
- **Stablecoins** (21 questions): covers the real mechanics (fiat vs.
  crypto-backed vs. algorithmic), the Terra/UST collapse as a case
  study in how algorithmic designs can fail, and the GENIUS Act — the
  first US federal stablecoin law, signed July 2025 — including the
  fact that it doesn't take full effect immediately, which matters if
  you're checking current compliance status.

512 questions across 16 subjects now. Every fact above was checked
against real sources — ethereum.org directly for the Merge, Coinbase's
own blog for Base, the White House fact sheet and Congress.gov for
the GENIUS Act — not written from memory.

## v0.3.5 — Bitcoin and Blockchain (the accuracy bar goes up here)

This is where I started actually web-searching to verify facts before
writing questions, rather than relying on memory — exactly as you
asked for the crypto subjects. Every historical claim in the Bitcoin
content (the whitepaper date, genesis block date, all four halving
dates, the current block reward, the SEC's Bitcoin ETF approval date,
El Salvador's 2025 legal-tender policy change) was checked against
real sources before it went into a question, not assumed.

- **Bitcoin** (45 questions): I'm flagging this one honestly — it's a
  strong, carefully-verified start, but Bitcoin is deep enough to
  eventually warrant hundreds of questions per your own sizing rule.
  45 is a solid foundation, not the finish line. I'll keep expanding
  it in a future session rather than padding it now just to hit a
  number.
- **Blockchain** (25 questions): kept strictly separate from
  Bitcoin — this one covers the general technology (how any blockchain
  works, consensus mechanisms in general, smart contracts as a
  concept) rather than Bitcoin's specific implementation. Zero topic
  overlap between the two, verified.
- Contested topics (energy debate, "digital gold," whether Bitcoin is
  "backed by nothing") are written as open discussions with fair
  framing, not settled answers — matching how the rest of this project
  handles genuinely debated topics.

443 total questions across 13 subjects now, still zero duplicates or
overlap anywhere.

## v0.3.4 — Five More Subjects: AI, Prompt Engineering, Git & GitHub, Linux, Programming

Halfway through the subject list now — 11 of 22 done. This batch
covers all of Class 4 through Class 7 technical foundations:

- **AI** (30 questions) and **Prompt Engineering** (22 questions) are
  kept intentionally separate — AI teaches the concepts (how AI works,
  bias, hallucinations, ethics), Prompt Engineering teaches the
  practical skill (how to actually get good results from it). I
  double-checked there's zero overlap between them.
- **Git & GitHub** (35 questions) and **Linux** (30 questions) stick
  strictly to real, verifiable technical facts — I avoided guessing at
  exact numeric limits or version-specific details I couldn't confirm,
  and only linked references to documentation URLs I'm actually
  confident are correct and stable.
- **Programming Basics** (28 questions) stays language-agnostic —
  concepts that apply whether someone eventually picks up Python,
  JavaScript, or anything else.

As always, ran the full cross-check before packaging: 373 total
questions across 11 subjects now, zero duplicates, zero overlap — and
I've upgraded the test suite so this check now runs automatically
across every subject at once, rather than needing separate checks
added by hand each time.

## v0.3.3 — Three More Subjects: Cyber Security, Password Safety, Digital Payments

Big content push this session — three more subjects complete, all
Class 2 and Class 3 curriculum:

- **Cyber Security** (43 questions): malware, phishing, social
  engineering, 2FA, encryption, firewalls — the broad threat-and-defense
  picture.
- **Password Safety** (34 questions): kept deliberately separate from
  Cyber Security — this one is specifically about password mechanics
  (managers, passphrases, hashing, passkeys), including a direct note
  on why these habits matter even more once members reach Wallet
  Security later in the curriculum.
- **Digital Payments** (31 questions): UPI scams, OTP scams, tokenization,
  chargebacks, and — importantly — the difference in reversibility
  between a normal card payment and a crypto transaction, setting up
  the Web3 subjects that come later without getting ahead of them.

Before packaging, I ran a full cross-check across all 6 completed
subjects at once: zero duplicate question IDs, zero duplicate question
text, and zero topic overlap between any two subjects — checked with
an actual script, not just eyeballed. 228 real questions total now
live in the repository.

## v0.3.2 — Digital Literacy Question Bank

Third subject complete: **Digital Literacy** (33 questions). This one
is different from Internet Basics — instead of technical mechanics
(browsers, DNS, HTTP), it teaches judgment skills: spotting
misinformation, evaluating whether a source is trustworthy,
understanding how algorithms shape what you see online, digital
wellbeing, accessibility basics, and recognizing manipulated media
(including a plain-language intro to deepfakes). I double-checked it
against Internet Basics to make sure there's zero overlap — two
distinct subjects, not one padded out to look like two.

## v0.3.1 — Required Chapter & Final Assessments

This is the update that makes your Quiz System Rules real:

- **Chapter Assessments are real and enforced.** A member can't skip
  ahead to Class 5 without passing Class 4's assessment first —
  `/assessment chapter` checks this automatically and tells them if
  something's still locked.
- **The Final Examination gates the Graduation Certificate**, exactly
  as you specified — `/assessment final` only unlocks once every
  chapter through Class 12 is passed.
- Retries are unlimited on both, and every wrong answer immediately
  shows the correct answer, why, a reference where one genuinely
  exists, and which topic to go review — nobody gets stuck without
  knowing what to do next.
- Daily/Weekly/Monthly quizzes remain explicitly optional and don't
  block anyone's progress, matching your Quiz System Rules exactly.
- Added a second question bank — Internet Basics (45 questions).

## v0.3.0 — Quiz Engine Foundation

**What this means for your community:**

- The bot can now run real quizzes. Members can practice any subject
  anytime with `/quiz practice`, and check their accuracy with `/quiz stats`.
- You can schedule a real quiz to auto-post with one command, e.g.:
  `/event create key:daily-quiz title:"Daily Quiz" channel:#quiz-arena type:quiz recurrence:daily hour_ist:9`
  — no code changes needed to adjust what fires when.
- **The first question bank went live**: Orientation (42 questions),
  mastery-based — enough to avoid repetition, nothing padded out to
  hit an arbitrary number, and every question automatically checked
  for placeholder text and structural correctness before being
  allowed into the bank.

**What's still missing (as of this version):** most subjects don't
have questions yet, XP isn't wired up (though every quiz answer is
already being recorded, so nothing will need to be rebuilt when XP
arrives), and there's no long-form lesson content or certificate PDF
generation yet. The bot also hasn't been deployed anywhere — it's all
sitting in this repository, ready to deploy once you complete the
one-time manual setup steps in `PROJECT_STATUS.md`.

---

## v0.2.0 — Security Engine

Your server now has real, automated protection, not just plans for it:

- **Anti-raid**: a sudden burst of joins automatically tightens
  verification and removes very-new accounts until things calm down.
- **Anti-spam**: flooding messages gets deleted and times the person out.
- **Anti-scam/phishing**: known scam links get deleted automatically,
  with repeat offenders escalating to a timeout.
- **NSFW protection**: using Discord's own free image scanning — no
  paid service needed.
- **Full audit trail**: `/audit recent` shows you exactly what's
  happened, and `/security status` gives you an at-a-glance health check.

All of this respects your "no Administrator permission" rule — every
piece only has the specific permission it needs.

---

## v0.1.0 — Foundation

The bot can connect to your server, welcome new members, walk them
through verification, and assign roles. Recurring events (like your
Sunday meeting) are fully configurable through Discord commands — no
code changes needed to adjust the schedule. And the whole server
rebuild (renaming, channels, roles) can be done with one script,
reviewed as a dry run before anything actually changes.
