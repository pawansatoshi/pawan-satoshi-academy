# Pawan Satoshi Academy — India Language Coverage

## Product commitment

The Academy will be usable by learners across India and will not treat English/Hindi as the only Indian-language paths.

### Initial India production-language target

The language selector and localization architecture include all 22 languages listed by the Government of India's Legislative Department in its regional-language resources:

1. Assamese — অসমীয়া
2. Bengali — বাংলা
3. Bodo — बड़ो
4. Dogri — डोगरी
5. Gujarati — ગુજરાતી
6. Hindi — हिन्दी
7. Kannada — ಕನ್ನಡ
8. Kashmiri — کٲشُر
9. Konkani — कोंकणी
10. Maithili — मैथिली
11. Malayalam — മലയാളം
12. Manipuri — মৈতৈলোন
13. Marathi — मराठी
14. Nepali — नेपाली
15. Odia — ଓଡ଼ିଆ
16. Punjabi — ਪੰਜਾਬੀ
17. Sanskrit — संस्कृतम्
18. Santali — ᱥᱟᱱᱛᱟᱲᱤ
19. Sindhi — سنڌي
20. Tamil — தமிழ்
21. Telugu — తెలుగు
22. Urdu — اردو

## Important distinction

The selector provides these language choices at the product layer. A selector entry must not be interpreted as proof that every lesson has already received professional human translation. A locale becomes **production-ready** only after its UI, lessons, assessments, feedback, accessibility text, voice behavior and certificate path have been validated.

## Beyond the 22

India has substantial linguistic diversity beyond the Eighth Schedule. The localization architecture therefore remains open-ended and must not reject a future Indian language merely because it is not one of the initial 22. Additional regional/community language packs can be added through the same locale resource and review pipeline.

## Quality requirements

- Preserve Web3, AI, cybersecurity and wallet terminology accurately.
- Keep canonical technical terms where translation could introduce ambiguity.
- Translate safety warnings and irreversible-action warnings without weakening them.
- Localize assessment questions, choices, explanations and result messages consistently.
- Support the correct script, Unicode normalization and RTL behavior where required.
- Use available device/browser voices for listening; do not claim a voice exists when the learner's platform does not provide one.
- Keep English available as a fallback when a reviewed translation is missing.
- Never expose secrets or private learner data to translation or voice services.
