# Note 20: Frontend Testing

## Summary
Codify the testing strategy so new features ship with confidence.

## Implementation Notes
- Use Jest + React Testing Library for unit/component tests; mock Socket.IO by abstracting network adapters.
- Add Cypress or Playwright scripts that run the lobby and a fake opponent to validate matchmaking flows.
- Snapshot test critical UI (leaderboard, match start overlay) to detect accidental style regressions.
- Gate merges on CI success once basic coverage is in place.

## Observability
- Track coverage percentages across statements/branches and set goals per directory.
- Record flaky tests automatically by rerunning failures and logging deterministic seeds.

## Next Steps
- Provide helper factories for building fake socket events so test authors don’t duplicate JSON.
- Document how to run tests in watch mode for quicker local cycles.
