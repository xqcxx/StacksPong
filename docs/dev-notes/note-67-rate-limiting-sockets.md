# Note 67: Socket Rate Limiting

## Summary
Socket event floods can crash the server. Define rate limiting strategy for websocket actions.

## Implementation Notes
- Implement per-socket token buckets for sensitive events (create/join room, chat) and drop/queue excess events.
- Use a sliding window to track bursts across short intervals and disconnect sockets abusing limits repeatedly.
- Mirror server limits client-side by disabling buttons until timers reset.
- Store counters in-memory with periodic cleanup; consider Redis for multi-instance setups.

## Observability
- Emit metrics for throttled events, grouped by event name.
- Alert when throttle counts spike; may indicate feature abuse or a bug causing loops.

## Next Steps
- Document configuration knobs (tokens per interval) and expose them via env vars.
- Write load tests to validate rate limits behave as expected under stress.
