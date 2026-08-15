# Changelog

All notable changes to this project are documented here.
Format based on [Keep a Changelog](https://keepachangelog.com/).

## [Unreleased]

### Added
- Phase 0: Repository scaffold (bot, academy, quizzes, certificates,
  website, docs, scripts directory structure)
- Governance files: README, LICENSE (MIT), SECURITY.md,
  CONTRIBUTING.md, CODE_OF_CONDUCT.md, CHANGELOG.md
- CI workflows: lint, test, GitHub Pages deploy
- `.env.example` with all required bot configuration variables
- Architecture documentation reflecting the forum-first, progressive
  -unlock Discord design and website-as-library content strategy

## [0.3.7] - Phase 3B: DeFi (no investment advice, factual risk description only)

### Added
- **DeFi question bank** (25 questions, 25 topics, class-11): DeFi vs. TradFi, DEXs, AMMs, liquidity pools, impermanent loss, lending/borrowing protocols, over-collateralization, automated liquidation, yield farming, smart contract risk, flash loans (including flash-loan attack patterns), oracles and oracle manipulation risk, governance tokens, rug pulls, composability ("money legos") and its risk-propagation tradeoff, TVL, slippage, regulatory uncertainty (presented evenhandedly), and a synthesizing risk-summary question
- Two historical exploit case studies included with appropriately hedged figures given source-to-source variance: Poly Network (Aug 2021, ~$600M+) and Ronin/Axie Infinity (Mar 2022, ~$600M+), both verified against multiple independent sources including contemporaneous reporting and later FBI/Treasury attribution details for Ronin
- New automated test: scans all DeFi question text/explanations/options for investment-advice or price-speculation language patterns ("guaranteed profit," "safe investment," etc.) — a permanent, mechanical safeguard against drift on this explicit user requirement, not just a one-time manual check
- 2 new pairwise topic-overlap tests (Base/Ethereum, DeFi/Stablecoins)

### Verified
- Impermanent loss, AMM, and liquidity pool mechanics cross-checked against multiple independent educational sources (Kraken, Gemini, Chainlink, academic papers) for mechanism accuracy
- Poly Network and Ronin exploit details verified against multiple news sources; used hedged language ("over $600 million") rather than a single precise figure, since sources reported slightly different amounts ($600M-625M range) depending on measurement timing and asset valuation method
- Full cross-file validation across all 17 completed subjects: 537 total questions, zero duplicate IDs, zero duplicate question text, zero topic overlap — confirmed both by script and 64/64 passing automated tests

## [0.3.6] - Phase 3B: Ethereum, Base, Stablecoins (fact-verified crypto content continues)

### Added
- **Ethereum question bank** (28 questions, 28 topics, class-9): whitepaper/founding history (Vitalik Buterin, 8 co-founders), July 30 2015 launch, "world computer" vision, smart contracts and EVM specifically on Ethereum, Solidity, ETH as native asset, gas fees, account model vs. Bitcoin's UTXO model, ERC-20/ERC-721 standards, the Merge (Sept 15 2022, ~99.95% energy reduction), validators/32 ETH staking, EIP-1559 fee burning, uncapped ETH supply (contrasted with Bitcoin's cap), The DAO hack and Ethereum Classic split, EIPs, Ethereum Foundation's role, dApps, spot Ethereum ETF approval (May 2024), Dencun upgrade, Layer 2 ecosystem intro (bridging into Base)
- **Base question bank** (20 questions, 20 topics, class-10): what Base is, Feb/Aug 2023 launch timeline, Coinbase as creator, OP Stack origin, Superchain vision, no native token (with dedicated scam-awareness questions), EVM equivalence, optimistic rollups, ~7-day withdrawal challenge period, sequencer centralization, progressive decentralization roadmap, gas paid in ETH, security inheritance from Ethereum — includes an explicit worked example (`base-006`) of flagging a version-dependent fact (Base's Feb 2026 shift away from OP Stack dependency) as subject to change rather than permanent
- **Stablecoins question bank** (21 questions, 21 topics, class-10): fiat/crypto-collateralized/algorithmic types, pegging and depegging mechanics, the Terra/UST collapse (May 2022) as a detailed case study, reserve attestations, counterparty risk, the GENIUS Act (signed July 18 2025 — first US federal stablecoin framework, 100% reserve requirement, phased effective-date timeline), CBDC distinction, redemption mechanics, trading/remittance use cases (appropriately hedged), market leaders (USDT/USDC), explicit "not all stablecoins carry equal risk" framing, bridge into the upcoming DeFi subject

### Verified (continuing the established accuracy discipline)
- Ethereum's Merge date and energy-reduction figure cross-checked directly against ethereum.org
- Base's launch timeline, no-token policy, and OP Stack origin verified against Coinbase's own blog/help center, with the Feb 2026 architectural shift verified against a dated CoinDesk report
- GENIUS Act signing date, vote counts, and reserve requirements verified against the White House fact sheet, Congress.gov, and multiple law-firm legal analyses (Gibson Dunn, Mayer Brown, Greenberg Traurig)
- Terra/UST collapse timeline and mechanism verified against multiple independent sources including a Federal Reserve working paper
- 4 new pairwise topic-overlap tests added (Bitcoin/Blockchain, Base/Stablecoins, Ethereum/Blockchain+Bitcoin, Base/Ethereum) confirming zero overlap between every closely-related subject pair
- Full cross-file validation across all 16 completed subjects: 512 total questions, zero duplicate IDs, zero duplicate question text, zero topic overlap — confirmed both by script and 61/61 passing automated tests

## [0.3.5] - Phase 3B: Bitcoin, Blockchain (fact-verified crypto content begins)

### Added
- **Bitcoin question bank** (45 questions, 43 topics, class-8): whitepaper/genesis block history, Satoshi Nakamoto, max supply, mining, Proof of Work, block time, difficulty adjustment, halving mechanics and full history, satoshi denomination, double-spend problem, decentralization, full nodes, pseudonymity vs. anonymity, UTXO model, public/private keys, mining hardware evolution, mining pools, Lightning Network, BIPs, first transaction (Hal Finney), Bitcoin Pizza Day, legal status misconceptions, hard/soft forks, Bitcoin Cash fork, custodial vs. non-custodial, SHA-256, energy debate (presented evenhandedly), spot Bitcoin ETF approval, block size scaling debate, SPV/light clients, El Salvador legal tender history including 2025 IMF-driven changes
- **Blockchain question bank** (25 questions, 25 topics, class-8): general/abstract blockchain concepts kept deliberately distinct from Bitcoin's specifics — distributed ledgers, block/hash-chain structure, Merkle trees, immutability, consensus mechanisms overview, Proof of Stake (general), permissionless vs. permissioned, smart contracts intro, blockchain trilemma, 51% attacks, blockchain vs. traditional databases, use cases beyond currency, Layer 1/Layer 2 (general), asset tokenization, interoperability, gas fees (general intro), scalability challenges — confirmed zero topic overlap with Bitcoin despite covering closely related territory

### Verified (per explicit accuracy requirements for crypto content)
- **Web search used to verify, not assume, every historical/factual claim** before writing: Bitcoin whitepaper date (Oct 31, 2008) and genesis block date (Jan 3, 2009) cross-checked against bitcoin.org and multiple sources; halving dates (2012, 2016, 2020, 2024) and current block reward (3.125 BTC) verified; SEC spot Bitcoin ETF approval date (Jan 10, 2024) verified directly against sec.gov; El Salvador's 2025 legal-tender-status change verified against IMF country reports and multiple news sources, and presented with appropriate hedging given its actively evolving, contested nature
- Debated/contested framings (digital gold narrative, energy consumption, "backed by nothing") explicitly presented as ongoing discussions rather than settled fact, consistent with evenhandedness requirements
- `reference` field left `null` wherever a specific stable URL wasn't confidently verified, rather than guessing at a plausible-looking but unconfirmed link
- Full cross-file validation across all 13 completed subjects: 443 total questions, zero duplicate IDs, zero duplicate question text, zero topic overlap — confirmed both by script and 55/55 passing automated tests

### Noted
- Bitcoin is flagged as an incomplete "large subject" — 45 questions is a strong, thoroughly-verified start but below the 300-500+ mastery-based target for a subject this deep. Marked for further expansion in a future session rather than padded now to inflate the count.

## [0.3.4] - Phase 3B: AI, Prompt Engineering, Git & GitHub, Linux, Programming

### Added
- **AI question bank** (30 questions, 30 topics, class-7): AI/ML/deep learning relationship, narrow vs. general AI, supervised/unsupervised learning, neural networks, training data quality, bias, hallucinations, generative AI, LLM fundamentals, knowledge cutoffs, AI ethics, alignment, overfitting, Turing test, AI vs. automation, computer vision, NLP, open vs. closed models, AI privacy — deliberately conceptual/literacy-focused, no overlap with Prompt Engineering's practical skill content
- **Prompt Engineering question bank** (22 questions, 22 topics, class-7): specificity, zero-shot/few-shot, chain-of-thought, role prompting, iterative refinement, output format constraints, task decomposition, temperature (framed as a common-but-not-universal setting), prompt injection as a security concern, context window awareness — verified zero topic overlap with AI subject
- **Git & GitHub question bank** (35 questions, 34 topics, class-4): init/clone, staging area, commits, branches, merging, merge conflicts, remotes, push/pull, .gitignore, never-commit-secrets, README, forking, pull requests, issues, GitHub Actions, GitHub Pages, Markdown, licensing, branch protection, mobile GitHub workflow — all technical claims cross-checked against real, stable Git/GitHub behavior; references linked only to genuinely known-good docs.github.com and git-scm.com URLs
- **Linux question bank** (30 questions, 27 topics, class-5): kernel/distro relationship, open-source connection to Academy values, terminal basics, core commands (ls/cd/pwd/mkdir/cat/grep/cp/mv), file permissions, chmod, sudo/root and least-privilege, package managers, filesystem hierarchy, piping, environment variables, processes, SSH, man pages, case sensitivity, why the Academy teaches this subject
- **Programming Basics question bank** (28 questions, 28 topics, class-6): variables, data types, booleans, conditionals, loops, functions, arrays, algorithms, syntax vs. logic errors, debugging, comments, pseudocode, compiled vs. interpreted, recursion, OOP basics, APIs, testing, off-by-one errors — kept language-agnostic throughout
- `tests/quizEngine.test.js` refactored around an `ALL_COMPLETED_BANK_PATHS` array (extend this one array per new subject going forward, instead of manually updating multiple hardcoded lists); added a global topic-overlap check across every file simultaneously, and a topic-diversity ratio check flagging any subject that looks padded with repetitive filler

### Verified
- Full cross-file validation across all 11 completed subjects: 373 total questions, zero duplicate IDs, zero duplicate question text, zero topic overlap between any pair — confirmed both by a standalone script and by 52/52 passing automated tests
- All factual/technical claims in Git & GitHub and Linux content restricted to well-established, verifiable behavior; spec-uncertain details (e.g., temperature parameter naming, exact GitHub tier limits) either omitted or explicitly framed as "commonly true, may vary by tool" rather than stated as universal fact

## [0.3.3] - Phase 3B: Cyber Security, Password Safety, Digital Payments

### Added
- **Cyber Security question bank** (43 questions, 29 topics, class-2): malware types, phishing/spear-phishing recognition, social engineering (pretexting, baiting), 2FA/SIM-swap risk, device encryption, symmetric/asymmetric encryption, firewalls, patch management, 3-2-1 backup rule, credential stuffing, brute-force/dictionary attacks, DDoS, IoT security, zero trust, HTTPS misconceptions, email spoofing, least-privilege principle, quishing (QR phishing), man-in-the-middle attacks
- **Password Safety question bank** (34 questions, 32 topics, class-2): length vs. complexity, passphrases, password managers, breach checking, entropy, hashing/salting, passkeys, dictionary/keyboard-walk patterns, recovery codes, emergency access, unique email aliases — deliberately scoped to password-specific mechanics, separate from Cyber Security's broader threat landscape
- **Digital Payments question bank** (31 questions, 31 topics, class-3): debit vs. credit, UPI safety (including the "enter PIN to receive money" scam pattern), tokenization, chargebacks, QR payment tampering, OTP scams, BNPL, virtual cards, escrow, dark patterns in subscription cancellation, payment reversibility as a deliberate bridge concept to the later Web3 subjects
- `tests/quizEngine.test.js`: extended with per-subject validation for all 3 new files, pairwise topic-overlap checks, and two NEW global checks that run across every completed subject file simultaneously — global unique-ID check and global duplicate-question-text check

### Verified
- Full cross-file validation script run across all 6 completed subjects: 228 total questions, zero duplicate IDs, zero duplicate question text, zero topic overlap between any pair of subjects — confirmed programmatically before packaging, not just asserted
- 45/45 real tests executed and passing in this session

## [0.3.2] - Phase 3B: Digital Literacy Question Bank

### Added
- **Digital Literacy question bank** (33 questions, 22 distinct topics): source credibility evaluation, misinformation vs. disinformation, digital identity, algorithmic personalization/filter bubbles, ads vs. content, copyright/fair use basics, digital wellbeing, accessibility (alt text, screen readers), research skills, media manipulation awareness (including deepfakes at a conceptual level), digital divide, app permission red flags, echo chambers, and a direct connection to why these skills matter before engaging with Web3/crypto communities
- `tests/quizEngine.test.js`: extended with Digital Literacy validation, plus a new cross-subject separation test confirming zero topic overlap between Internet Basics and Digital Literacy

### Verified
- Manually cross-checked Digital Literacy against Internet Basics for topic and question-text overlap before finalizing — zero overlap, confirmed by both a standalone script and the new automated test

## [0.3.1] - Phase 3A Extension: Required Assessments + Second Question Bank

### Added
- **Quiz System Rules implemented exactly as specified**: Practice/Daily/Weekly/Challenge are optional; Chapter Assessment and Final Examination are required and gate curriculum progression
- `quizzes/schema/subject-class-mapping.json` — canonical subject→class mapping, single source of truth for chapter assessments and future content generation
- `modules/progress/curriculum.js` — pure, dependency-free curriculum-unlock logic (real-tested)
- `modules/progress/index.js` — DB-backed wrapper connecting curriculum logic to member completion state
- New DB table: `class_completions` (records passing attempts only; unlimited retries by design — failed attempts don't need tracking)
- `randomizer.js`: `selectChapterAssessmentQuestions` (pulls from every subject tagged with a class), `selectFinalExamQuestions` (comprehensive across Class 1-12, excludes Orientation)
- `quiz-engine/index.js` generalized from practice-only into a full session engine covering all 6 modes; pass/fail logic with configurable thresholds (Chapter: 70%, Final: 75%)
- Every wrong answer now shows correct answer + explanation + reference + suggested topic to review, in every mode
- `/assessment chapter`, `/assessment final`, `/assessment progress` commands
- **Internet Basics question bank** (45 questions, 36 distinct topics): browsers, URLs, DNS, HTTP/HTTPS, IP addresses, connectivity troubleshooting, email basics, cookies, VPN basics, HTTP status codes, and more
- Tests: `tests/curriculum.test.js` (11 cases, includes cross-validation against real Orientation data); `quizEngine.test.js` extended to validate the real Internet Basics file
- `EMPTY_FOLDERS.md` — tracks every scaffolded-but-unpopulated directory and why, so nothing is mistaken for missing/broken work
- `RELEASE_NOTES.md` — human-readable release summary, separate from this technical changelog

### Changed
- `SESSION_BUTTON_PREFIX` replaces `PRACTICE_BUTTON_PREFIX` (button routing generalized for all session-based quiz modes, not just practice)
- `recurring_events` table: added `quiz_subject`, `quiz_class`, `quiz_count` columns
- `PROJECT_STATUS.md`: added Quiz System Rules table, updated content queue (2/22 complete)

## [0.3.0] - Phase 3A: Quiz Engine + First Question Bank

### Added
- `quizzes/schema/question-schema.json` — canonical question format
- `modules/quiz-engine/validator.js` — dependency-free validation,
  rejects malformed questions AND placeholder text markers at load time
- `modules/quiz-engine/loader.js` — recursive discovery of all JSON
  files under `quizzes/question-banks/`, validates on load, builds
  in-memory index, logs stats and any rejected questions
- `modules/quiz-engine/shuffle.js` — pure option-shuffling (extracted
  from randomizer.js specifically so it stays dependency-free and
  testable)
- `modules/quiz-engine/randomizer.js` — mode-specific selection for
  Practice/Daily/Weekly/Monthly, with repeat-avoidance via quiz history
- `modules/quiz-engine/index.js` — practice session engine (ephemeral,
  step-through, per-question feedback) and community quiz posting
  (shared channel, one-answer-per-member enforced at the DB level)
- `/quiz practice` and `/quiz stats` slash commands
- Event Management integration: `/event create type:quiz` now posts
  real quizzes via the quiz engine instead of a generic announcement;
  new `quiz_subject`/`quiz_class`/`quiz_count` event fields
- New DB tables: `quiz_attempts`, `community_quiz_answers`; new
  repository functions: `recordQuizAttempt`, `getRecentQuestionIdsForMember`,
  `getMemberQuizStats`, `recordCommunityQuizAnswer`
- **Orientation question bank** (`quizzes/question-banks/orientation/orientation.json`):
  42 real, non-placeholder questions covering 21 distinct topics —
  academy structure, verification, safety, roles/XP, governance,
  security design rationale, and more. Mastery-based sizing per your
  instruction, not padded to a fixed quota.
- `docs/modules/quiz-engine.md` — full documentation including the
  content queue for the remaining 21 subjects
- Tests: `tests/quizEngine.test.js` — 9 real, passing tests, including
  live validation of the actual Orientation content file (content
  quality is checked by CI, not just assumed)

### Changed
- `PROJECT_STATUS.md`: added Phase 3A/3B/3C breakdown and the
  22-subject content queue in priority order

## [0.2.0] - Phase 2: Security Engine

### Added
- **Permission System**: `canModerate()` staff-rank hierarchy check in
  `core/permissions.js`, preventing lower-ranked staff from moderating
  equal/higher-ranked staff
- **Anti-Raid** (`antiRaid.js`): join-rate detection, temporary
  verification-level raise, new-account auto-kick during raid windows
- **Anti-Spam** (`antiSpam.js`): per-user message rate limiting and
  duplicate-flood detection with automatic timeout
- **Anti-Phishing / Anti-Scam** (`antiPhishing.js`): URL/domain
  blocklist + lookalike-domain heuristics, escalating warn → delete →
  timeout response
- **NSFW Protection** (`nsfw.js`): Discord's native Explicit Content
  Filter set to scan all members — free, no external API
- **Logging** (`logging.js`): mirrors native Discord audit log entries
  and AutoMod executions to the database and staff channels
- **Audit System**: `listAuditLogEntries()` repository function,
  `/audit recent` and `/security status` slash commands
- New events: `messageCreate`, `guildAuditLogEntryCreate`,
  `autoModerationActionExecution`
- Security engine wired into the scheduler tick (raid-mode expiry,
  spam-state pruning) and into `guildMemberAdd` (raid check runs
  before welcome/role assignment)
- `docs/modules/security-engine.md` — full documentation
- `PROJECT_STATUS.md` — new top-level phase tracker
- Tests: `permissions.test.js` extended with 8 `canModerate` cases,
  new `antiPhishing.test.js` with 6 cases

### Changed
- `moderation-automod/index.js` restructured as an aggregator over
  `automod.js`, `antiRaid.js`, `antiSpam.js`, `antiPhishing.js`,
  `nsfw.js`, `logging.js`
- `index.js` gateway intents: added `AutoModerationExecution`
- `events/ready.js` now calls `setupSecurity()` (AutoMod + NSFW) instead
  of AutoMod alone

## [0.1.0] - Phase 1

### Added
- `core/config`, `core/database`, `core/logger`, `core/permissions`,
  `core/server-map`, `core/discord-sync`
- `scripts/bootstrap-server.js` — dry-run-by-default, `--confirm`-gated
  automated server rebuild (rename, roles, categories, channels,
  progressive-unlock permission overwrites, legacy channel remap).
  Never deletes, never touches existing third-party bot roles, never
  requests Administrator.
- `welcome`, `verification`, `roles`, `moderation-automod` modules
- **Event Management module** (`modules/events`, `commands/event.js`,
  `automation/scheduler`): fully database-driven recurring events
  (meetings, quizzes, challenges, announcements) with `/event
  create|edit|postpone|cancel|resume|disable|delete|list` slash
  commands. Zero hardcoded schedules in source.
- Server-map updated to the final approved structure: one Academy Hub
  forum channel (replaces per-subject channels), ~32 total channels,
  ~28 visible to a verified member
- Unit tests: `recurrence.test.js` (12/12 passing), `permissions.test.js`

## Migration Notes

This project targets one existing Discord server
(`discord.gg/hvHNpT4xX`) exclusively. No new server is ever created.
The server will be renamed to "Pawan Satoshi Academy" as part of Phase
1, and rebuilt using forum channels, threads, and progressive
unlocking rather than a large flat channel list. All five pre-existing
bots (TBOOK Bot, Captcha.bot, Welcomer, MEE6, Statbot) remain active
and untouched until their custom-bot replacements are built, tested,
and explicitly approved for retirement.
