# Pawan Satoshi Academy — Master Blueprint

## Mission

Build a completely free, beginner-first Web2/Web3/AI learning ecosystem that can serve a learner anywhere in the world, regardless of native language, device, technical background or learning style. The Academy combines a professional web learning experience with the existing Discord community and a secure bot.

The curriculum follows a real school progression: early classes are simple and foundational; later classes become broader, deeper, more technical and more practical. The target outcome is not token speculation. It is digital literacy, safe Web3 usage, research ability, communication, community contribution, AI fluency and builder-level competence.

## Non-negotiables

- Existing Discord server only: `https://discord.gg/hvHNpT4xX`
- No mandatory paid service for joining, learning, quizzes, certificates, voice lessons or community access.
- Least-privilege Discord permissions; never grant Administrator to automation roles.
- Owner retains ultimate control.
- No placeholder features or fake integrations.
- Mobile-first and desktop-quality UX.
- Accessibility is a product requirement, not an optional enhancement.
- Official sources preferred for technical/crypto facts.
- Practice quizzes are optional; Chapter Assessments and Final Examination are required only for progression/certification.
- Educational translations must preserve technical meaning, safety warnings, scoring rules and source references.
- Never expose seed phrases, private keys, API keys or other secrets in lessons, examples or telemetry.
- No financial promises, investment guarantees or misleading growth claims.

## Global learning model

### Language architecture

The Academy must be localization-first rather than English-first with a few translated pages.

- Locale is detected from the browser/device and can always be changed manually.
- Language selection is persistent per learner/device.
- UI strings, curriculum metadata, lessons, assessments, feedback, certificates and accessibility labels use locale-aware resources.
- The architecture must support any language representable by Unicode and must not hard-code a small fixed language list as the product limit.
- Initial language packs should cover major global languages and grow through reviewed translation packs.
- Translation provider integration is adapter-based. No single external translation provider is mandatory for core operation.
- Technical terms may retain the canonical English term beside the translated explanation where that improves accuracy.
- Right-to-left languages must be first-class, including mirrored layout, typography and navigation where appropriate.
- Date, number, percentage and certificate formatting use locale-aware `Intl` APIs.
- Missing translations fall back predictably to the source locale and are visibly identifiable to maintainers.

### Voice and audio learning

Every lesson is designed to be listenable, not merely readable.

- Dynamic voice selection from voices available on the learner's device/browser.
- Language-aware voice matching where the platform exposes a suitable voice.
- Play, pause/resume and stop controls.
- Adjustable rate and pitch; safe defaults for learning.
- Read the current section or the full lesson.
- Skip code blocks, URLs and unsafe secret-like strings by default.
- Keyboard and touch controls.
- Respect reduced-motion and accessibility preferences.
- Voice availability is progressive enhancement: the lesson remains fully usable without speech synthesis.

### Interactive class model

Each chapter follows a repeatable learning loop:

`Explain → Example → Visual/Scenario → Guided Practice → Knowledge Check → Reflection → Chapter Assessment`

Each class contains seven progressive chapters. Difficulty increases from Class 1 through Class 12.

- Class 1: digital literacy and safe learning.
- Classes 2–4: wallets, networks, transactions and security foundations.
- Classes 5–8: tokens, swaps, DeFi, bridges, staking/mining, minting, explorers and research.
- Classes 9–10: programming, Git/GitHub, smart contracts and dApp building.
- Class 11: AI, ChatGPT/Claude workflows, research, article writing, X/Twitter and Discord/community operations.
- Class 12: advanced Web3 research, ecosystem work, professional communication, growth, community management and capstone delivery.

Interactive exercises should use safe sandboxes/testnets whenever an action could otherwise require funds or expose a user to irreversible risk.

## System

1. **Discord Bot** — onboarding, verification, moderation, events, quizzes, assessments, progress, XP, certificates, tickets, AI helper and community automation.
2. **Academy Content** — Orientation → Class 1 → Class 12 → Graduation, with seven chapters per class, lessons, examples, labs, assignments, references and localized variants.
3. **Static Website** — GitHub Pages, mobile-first, course catalogue, interactive lessons, language selector, voice controls, resources, community links and free certificate verification using exported public JSON.
4. **Learning Data Contract** — stable IDs for locale, class, chapter, lesson, assessment, question, exercise, score and certificate so web and Discord experiences can evolve independently.
5. **Localization Pipeline** — source-language content, translation resources, validation, glossary management and review status. Machine translation may accelerate drafts but published educational content requires quality review.

## Assessment and progression

- Chapter Assessment: 15 questions by default, 70% pass threshold, unlimited retries.
- Final Examination: 40 questions by default, 75% pass threshold, unlimited retries.
- Scores are stored with the learner's attempt metadata; progression is based on the required assessment result, not optional daily/community quiz activity.
- Web and Discord must converge on the same conceptual curriculum/progression rules.
- Future capstone assessment can add practical evidence without weakening the existing required assessment rules.
- Certificates are multilingual-aware and preserve a stable certificate ID for public verification.

## Curriculum scope

Orientation; Internet Basics; Digital Literacy; Cyber Security; Password Safety; Wallets; Public/private keys and recovery phrases; Digital Payments; Blockchain Networks; Transactions; Explorers; Git & GitHub; Linux; Programming; AI; Prompt Engineering; ChatGPT; Claude; Bitcoin; Mining and consensus; Blockchain; Ethereum; Base; Stablecoins; Tokens; NFTs; Minting; DeFi; Swaps; Liquidity; Staking; Bridges; Wallet Security; Testnets; Smart Contracts; dApps; On-chain Research; Project Due Diligence; Article Writing; X/Twitter; Discord; Roles and permissions; Community Management; Ethical ecosystem contribution; Growth/marketing fundamentals; Capstone; Graduation.

## Engagement

Daily/weekly quizzes, optional challenges, XP, levels, badges, leaderboard, Hall of Fame, suggestions, polls, study groups, scheduled community meetings, safe practical activities, interactive lessons, chapter checkpoints and learner progress dashboards.

## Security

Anti-raid, anti-spam, anti-phishing, anti-scam, NSFW protection, audit logging, secure secret handling, role hierarchy enforcement and owner override. Web learning activities must clearly distinguish mainnet from testnet and explain irreversible actions before execution.

## Accessibility and inclusion

- WCAG-oriented semantic HTML, keyboard navigation, visible focus states and accessible labels.
- Responsive layouts for small Android phones through large desktop screens.
- RTL support.
- Captions/transcripts for audio/video where used.
- Text alternatives for visual teaching material.
- Adjustable reading size and comfortable contrast.
- Voice is optional and never the only route to learning.
- No essential interaction depends on hover, color alone or audio alone.

## Architecture principle

SQLite is the bot-side source of truth. The website never connects directly to the bot database; public non-sensitive data is exported as static JSON for GitHub Pages. Localization assets that are public can be shipped with the static site; private learner data remains runtime-side.

## Deployment and provider resilience

The core Academy must remain usable if an optional AI, translation or speech provider is unavailable. Browser-native speech is the default audio enhancement. External providers are adapters with explicit configuration, timeout handling, graceful fallback and no secret leakage to the client.

## Completion definition

The project is not complete until every mandatory feature has a real implementation, tests where applicable, documentation, security review and a verified deployment path. A scaffolded directory is not considered a completed feature.

For the global-learning expansion, “all languages” means the architecture can support any Unicode language and a scalable translation/voice provider pipeline; it does **not** mean claiming that every lesson has already been professionally translated into every language. A locale is marked production-ready only after its content, UI, assessment, accessibility and certificate paths have passed validation.
