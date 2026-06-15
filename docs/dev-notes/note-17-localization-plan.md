# Note 17: Localization Plan

## Summary
Localization is not in scope yet, but defining the plan will reduce refactors when we ship multilingual support.

## Implementation Notes
- Externalize user-facing copy into a translations module; start with English JSON to prove the pattern.
- Use ICU message format to cover pluralization and gendered phrases; integrate `react-intl` or `i18next` later.
- Avoid concatenated strings in code; rely on placeholders to keep translators productive.
- Provide context comments in the translation files to clarify retro slang references.

## Observability
- Track which locales players request once we expose the setting to decide where to invest translation budget.
- Add CI check ensuring every message key has entries for required locales.

## Next Steps
- Prototype locale switching in the lobby only to vet layout impact.
- Document translation update workflow (e.g., using a spreadsheet export) before external contributors join.
