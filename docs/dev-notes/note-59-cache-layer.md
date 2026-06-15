# Note 59: Cache Layer

## Summary
A cache reduces load on the player service and backend. Document options and patterns.

## Implementation Notes
- Start with Redis as a shared cache for leaderboard data and active room metadata.
- Use TTLs appropriate to each data type (leaderboard: 5s, matchmaking state: <1s).
- Implement cache stampede protection by locking or using stale-while-revalidate for expensive fetches.
- Document invalidation triggers clearly; e.g., rating changes should invalidate leaderboard caches immediately.

## Observability
- Track cache hit/miss ratio and memory usage.
- Alert on connection drops or eviction spikes indicating insufficient capacity.

## Next Steps
- Consider client-side caching hints (ETags) for REST endpoints.
- Evaluate CDN caching for static leaderboard snapshots if browser caching suffices.
