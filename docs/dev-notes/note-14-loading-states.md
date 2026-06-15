# Note 14: Loading States

## Summary
Loading indicators reduce player confusion during matchmaking and asset downloads. Document the states we expose and their triggers.

## Implementation Notes
- Represent each high-level phase (`connecting`, `searching`, `countdown`, `inGame`) and map them to UI skeletons or spinners.
- When searching for a match, show expected wait time and a cancel button that emits `cancelFindRandomMatch`.
- Lazy load heavy assets (audio, fonts) and display progress bars to set expectations on slower networks.
- For backend-driven waits (e.g., opponent reconnect), surface server-provided messages so localization stays centralized.

## Observability
- Measure the average time spent in each loading state to identify bottlenecks.
- Capture cancellation reasons vs actual backend cancellation events to detect mismatches in flow.

## Next Steps
- Add skeleton components for the leaderboard to avoid layout jumps.
- Provide more personality in loading copy to keep the retro voice consistent.
