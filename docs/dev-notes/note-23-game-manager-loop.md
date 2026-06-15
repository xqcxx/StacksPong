# Note 23: Game Manager Loop

## Summary
The authoritative game loop in `backend/src/gameManager.js` runs 60 times per second. Documenting its responsibilities keeps gameplay consistent.

## Implementation Notes
- Store per-room game state objects with ball, paddles, score, and lastTick timestamp; update them inside a `setInterval` or `setTimeout` chain.
- Use delta time to keep speeds consistent even if the interval drifts; `const delta = Date.now() - state.lastTick`.
- Emit updates only when positions change beyond a small epsilon to reduce bandwidth.
- Provide hooks for future power-ups so new features can attach without rewriting the loop.

## Observability
- Log tick lag (expected vs actual interval) and keep a moving average per room.
- Track CPU time spent inside the game loop to size servers properly.

## Next Steps
- Consider migrating to a shared scheduler (e.g., `setImmediate` + priority queue) for better drift control.
- Document how the loop stops when a match ends to avoid zombie intervals.
