# Note 41: Reconnection Logic

## Summary
Reconnection ensures temporary blips do not ruin matches. Document the states and timers involved.

## Implementation Notes
- On the frontend, implement exponential backoff for socket reconnect attempts with a cap to avoid thrashing.
- Keep a `reconnectAttempts` counter and show progress to the user, offering a manual retry option.
- Backend should maintain room membership for a grace period and allow sockets that present the same session token to reclaim their slot.
- Once the grace window expires, emit `forfeit` events to both players with context.

## Observability
- Track number of reconnection attempts per session and success rates.
- Log reasons reconnects fail (invalid token, room closed) for debugging.

## Next Steps
- Consider persisting minimal state in Redis to enable reconnection even if the backend process restarts.
- Document how reconnection interacts with tournaments or spectator sessions.
