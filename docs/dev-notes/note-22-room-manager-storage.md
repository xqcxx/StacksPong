# Note 22: Room Manager Storage

## Summary
RoomManager orchestrates all matches. Documenting its data structures makes it easier to reason about concurrency and memory use.

## Implementation Notes
- Use a `Map` keyed by room code containing metadata (players, sockets, status, createdAt).
- Provide helper methods (`addPlayer`, `removePlayer`, `markInGame`) instead of mutating the map across modules.
- Encapsulate timers (countdown, idle cleanup) inside the manager to avoid dangling intervals when rooms close.
- Persist basic stats (games per hour, average duration) to optionally share with analytics later.

## Observability
- Expose a `/rooms` debug endpoint returning high-level counts for ops debugging.
- Log when rooms exceed expected lifetimes or contain mismatched player counts.

## Next Steps
- Evaluate moving room state into a dedicated service if we ever run multiple backend instances.
- Document concurrency expectations should we add worker threads.
