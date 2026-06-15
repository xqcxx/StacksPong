# Note 43: Bot Players

## Summary
Bots can fill queues during off hours. Document desired behavior and integration points.

## Implementation Notes
- Add a bot service or module that implements the same interface as a socket connection (responds to `gameUpdate`, sends paddle inputs).
- Provide difficulty presets adjusting reaction time and prediction accuracy.
- Tag matches with bots so leaderboards can ignore them or weight them differently.
- Ensure matchmaking logic can request a bot when queue wait times exceed thresholds.

## Observability
- Track bot usage metrics and win rates to ensure difficulty feels fair.
- Log bot decision latency to monitor CPU requirements.

## Next Steps
- Allow developers to spawn bots locally via CLI for testing.
- Explore ML-driven bots later, but start with deterministic heuristics.
