# Note 02: Room Code Generation

## Summary
Room codes power private games and are reused for the transient quick-match rooms. We should codify how `roomManager.js` creates six-character codes, how collisions are handled, and where to plug in analytics for debugging collisions or brute-force scans.

## Implementation Notes
- Codes are alphanumeric uppercase strings generated with `Math.random().toString(36)` and slicing; wrap this inside a helper so we can swap algorithms without touching the handler.
- Maintain a `Set` of active codes (already available on the `rooms` Map) and re-roll when collisions appear; log and cap retries to prevent infinite loops under high churn.
- Consider time-based segments (e.g., prefix with base32 timestamp) to help operators reason about age during incident response.
- When exposing codes to clients, filter user input to uppercase automatically and trim whitespace so the backend receives canonical strings.

## Observability
- Track generated code counts per minute, collision retries, and expired room cleanups.
- Emit structured logs linking a room code with creator socket ID to audit abuse or brute-force attempts.

## Next Steps
- Evaluate deterministic code generation for invite-only tournaments where codes encode bracket IDs.
- Store last-used timestamps on rooms and create a janitor job to purge stale entries beyond fifteen minutes.
