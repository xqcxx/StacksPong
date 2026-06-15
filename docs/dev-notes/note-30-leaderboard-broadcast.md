# Note 30: Leaderboard Broadcast

## Summary
Broadcast cadence affects bandwidth and freshness. This note details how `leaderboardManager.js` should push updates.

## Implementation Notes
- Gather player deltas at the end of each match and push one consolidated `leaderboardUpdate` event to all subscribers (emit `rankingsUpdate` as an alias until legacy clients disappear).
- Debounce updates—if multiple matches end simultaneously, compose a single payload containing sorted top players.
- Include metadata (timestamp, server version) for debugging.
- Provide REST fallback to fetch the latest leaderboard on client reconnect.

## Observability
- Measure broadcast duration and queue size to ensure we stay within sub-100ms target.
- Count dropped emits (sockets disconnected mid-send) and reconnect clients as needed.

## Next Steps
- Partition broadcasts by region or rating bracket if fan-out becomes expensive.
- Consider caching payloads in Redis for multi-instance deployments.
