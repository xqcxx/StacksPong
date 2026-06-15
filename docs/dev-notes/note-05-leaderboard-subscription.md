# Note 05: Leaderboard Subscription

## Summary
Leaderboards update live via Socket.IO broadcasts from `leaderboardManager.js`. Documenting the subscription strategy will help keep bandwidth predictable and ensures we can degrade gracefully when the backend is under load.

## Implementation Notes
- The frontend subscribes to `leaderboardUpdate` (and the temporary alias `rankingsUpdate`) via the new `useLeaderboardSubscription` hook that owns socket lifecycle work.
- Debounce UI updates so we do not rerender the leaderboard 60 times per second—aim for a 1s refresh or only on change detection.
- On the backend, consolidate updates so every finished match triggers one payload that includes ranks, rating deltas, and a timestamp.
- Provide pagination support for future long leaderboards by letting clients request a slice and caching results server-side.
- Hardcode the slice size in `LEADERBOARD_LIMIT` so both REST and socket requests stay aligned.

## Observability
- Measure payload sizes and emit a histogram metric; this will highlight regressions when we add additional metadata.
- Count the number of connected clients listening to leaderboard events so scaling decisions can consider fan-out.

## Next Steps
- Allow the client to unsubscribe temporarily (e.g., when minimized) to save bandwidth.
- Support fallback to REST polling for environments where websockets are blocked.
