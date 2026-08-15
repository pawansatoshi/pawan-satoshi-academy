# Quiz Engine

## Purpose

Delivers Daily Quiz, Weekly Quiz, Monthly Exam, and Practice Mode from
a mastery-based question bank — enough questions per topic to avoid
repetition, never padded with filler just to hit a number.

## Architecture

```
quizzes/question-banks/<subject>/<file>.json   ← content (data, not code)
        │
        ▼
bot/src/modules/quiz-engine/validator.js       ← rejects bad data at load time
        │
        ▼
bot/src/modules/quiz-engine/loader.js          ← builds in-memory bank, called once at bot startup
        │
        ▼
bot/src/modules/quiz-engine/shuffle.js         ← pure option-shuffling (no dependencies)
bot/src/modules/quiz-engine/randomizer.js      ← mode-specific selection + repeat-avoidance (uses DB)
        │
        ▼
bot/src/modules/quiz-engine/index.js           ← session orchestration (practice + community quizzes)
        │
        ├─ commands/quiz.js                    ← /quiz practice, /quiz stats
        └─ modules/events/index.js fireEvent()  ← daily/weekly/monthly quizzes, via the Event Management module
```

## Question File Format

Every question must match `quizzes/schema/question-schema.json`. Fields:

| Field | Type | Notes |
|---|---|---|
| `id` | string | Globally unique, lowercase/numbers/hyphens only, e.g. `orientation-014` |
| `class` | string | One of: orientation, class-1..class-12, graduation |
| `subject` | string | Slug matching the 22-subject curriculum, e.g. `bitcoin` |
| `topic` | string | Narrower than subject, e.g. `wallet-types` |
| `difficulty` | string | beginner / intermediate / advanced |
| `question` | string | ≥10 characters |
| `options` | string[4] | Exactly 4, no duplicates |
| `correctAnswer` | integer | Index 0-3 into `options` |
| `explanation` | string | Shown after answering, ≥10 characters |
| `tags` | string[] | At least 1 |
| `reference` | string \| null | Official docs URL where genuinely applicable, else `null` — never fabricated |

Add a new subject by creating `quizzes/question-banks/<subject>/<file>.json` — no code changes needed. The loader picks up every JSON file recursively at startup.

## Validation ("no placeholders" enforced in code, not just policy)

`validator.js` rejects:
- Missing/malformed required fields
- Fewer or more than 4 options, or duplicate options
- `correctAnswer` outside 0-3
- Question/explanation text under 10 characters
- **Placeholder markers**: "TODO", "placeholder", "lorem ipsum", "FIXME", "xxx", "sample question" anywhere in the question text
- Duplicate `id` within the same load

Invalid questions are excluded from the live bank and logged loudly at startup — a bad file degrades gracefully instead of crashing the bot or silently reaching production.

## Selection Logic (`randomizer.js`)

| Mode | Function | Behavior |
|---|---|---|
| Practice | `selectPracticeQuestions` | Member picks subject (+ optional difficulty/count), fully random from that pool |
| Daily | `selectDailyQuizQuestions` | Random across the whole bank, avoiding questions that member answered in the last 7 days |
| Weekly | `selectWeeklyQuizQuestions` | Filtered by subject/class, larger set |
| Monthly | `selectMonthlyExamQuestions` | Filtered by class, weighted toward intermediate/advanced where the bank supports it |

All modes fall back to allowing repeats rather than failing outright if a mastery-sized bank is smaller than the requested count — a 42-question Orientation bank should never break a 5-question daily quiz.

Options are re-shuffled per delivery (`shuffleOptions`) so the correct answer isn't always in the same position.

## Delivery Styles

- **Practice** (`/quiz practice`): ephemeral, one member, step-through with immediate per-question feedback, using an in-memory session store keyed by a random session ID embedded in the button `customId`.
- **Community** (daily/weekly/monthly, fired by the Event Management module): one message per question posted to a shared channel (e.g. `#quiz-arena`), answerable by anyone once — enforced at the database level via a `(message_id, member_id)` primary key, not just application logic.

## Connecting Quizzes to Recurring Events

`/event create` accepts `quiz_subject`, `quiz_class`, and `quiz_count` when `type=quiz`. The recurrence rule determines the mode: `daily`→Daily Quiz, `weekly`→Weekly Quiz, `monthly`→Monthly Exam. Example:

```
/event create key:daily-quiz title:"Daily Quiz" channel:#quiz-arena type:quiz recurrence:daily hour_ist:9 quiz_count:1
```

This is fully data-driven — no code change is needed to adjust what fires when.

## Scoring & Stats

Every answered question (practice or community) is recorded in `quiz_attempts`. `/quiz stats` shows a member's lifetime accuracy. XP rewards for correct answers will be wired in once the XP system (Phase 2 remainder) is built — the data is already being captured so nothing needs to be retrofitted.

## Content Status

| Subject | File | Question Count | Status |
|---|---|---|---|
| Orientation | `orientation/orientation.json` | 42 | ✅ Complete, validated |
| Internet Basics | — | 0 | ⬜ Not yet written |
| Digital Literacy | — | 0 | ⬜ Not yet written |
| *(remaining 19 subjects)* | — | 0 | ⬜ Not yet written |

Content is generated incrementally, subject by subject, in curriculum priority order — see `PROJECT_STATUS.md` for the current queue.

## Testing

- `validator.js` and `shuffle.js` are dependency-free and unit-tested directly (`tests/quizEngine.test.js`) — these tests execute for real in any environment, including this project's build sandbox.
- The **actual Orientation content file** is validated by the test suite itself (`the real Orientation question bank file is 100% valid, zero rejects`) — content quality is checked by CI, not just assumed.
- `loader.js` and `randomizer.js` depend on the database/filesystem and are syntax-checked; full execution happens in CI (`npm install` has network access there).

## Troubleshooting

- **A subject shows "no questions available yet"**: no JSON file exists for that subject yet, or all its questions failed validation — check the startup log for rejected-question warnings.
- **A daily quiz posts the same question repeatedly**: the bank for the filtered pool is smaller than the requested count, so repeat-avoidance falls back to allowing repeats — this is expected for small, newly-added subjects and resolves itself as more questions are added.
- **A new question isn't showing up**: confirm the file is valid JSON and passes validation — run `node --test tests/quizEngine.test.js` after adding a similar assertion for the new subject, or check bot startup logs for rejection warnings.
