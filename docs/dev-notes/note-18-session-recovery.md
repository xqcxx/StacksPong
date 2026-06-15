# Note 18: Session Recovery

## Summary
Players occasionally refresh mid-match. Document how session recovery works (or should work) to minimize abandoned games.

## Implementation Notes
- Store the active room code and role (host/guest) in sessionStorage so refreshes can request a resume token.
- Upon reconnect, emit `rejoinRoom` with the saved code and let the backend validate whether the slot is still available.
- Keep a grace period timers server-side; hold the game state for ~20 seconds before declaring a forfeit.
- When resuming, fast-forward the last known state to the resumed player, including score and elapsed time.

## Observability
- Track reconnection attempts and success rates to identify flaky flows.
- Emit an alert when rejoin requests fail due to mismatched room codes; this likely means a frontend bug.

## Next Steps
- Provide UI messaging (“Reconnecting… hold tight”) so players are less tempted to leave.
- Investigate server-side session tokens to distinguish legitimate rejoin attempts from malicious reuse.
