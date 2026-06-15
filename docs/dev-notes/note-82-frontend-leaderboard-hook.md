# Note 82 – Frontend Leaderboard Hook

## Summary
- Centralizes leaderboard fetching and WebSocket subscriptions inside `useLeaderboardSubscription`.
- Keeps the Welcome screen lean and allows future reuse inside profile or tournament dashboards.

## Key Behaviors
- Boots with a REST fetch capped by `LEADERBOARD_LIMIT`.
- Subscribes to both `leaderboardUpdate` and `rankingsUpdate` events upon socket connect.
- Surfaces an `isLoading` flag so components can render placeholders before the first payload arrives.

## Follow-ups
- Expose a manual `refresh()` method for debugging.
- Share the socket instance with other lobby widgets to minimize duplicate connections.
