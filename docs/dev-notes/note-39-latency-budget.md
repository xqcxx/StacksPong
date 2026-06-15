# Note 39: Latency Budget

## Summary
Understanding where milliseconds go helps maintain the arcade feel. Define a latency budget from input to render.

## Implementation Notes
- Target <120ms total: input capture (10ms) + socket transit (40ms) + server processing (20ms) + outbound emit (10ms) + client render (40ms).
- Instrument each hop with timestamps/tracing IDs so we can compute actual latency per match.
- Use WebRTC-style stats or Socket.IO middleware to embed server timestamps in payloads for round-trip estimation.
- Consider edge deployments for regional players to shrink network latency.

## Observability
- Build dashboards showing latency percentiles per region and time of day.
- Alert when median latency exceeds targets for 5+ minutes.

## Next Steps
- Document mitigation playbook (scale up, reroute traffic) when latency budgets are violated.
- Investigate UDP relays if browsers ever expose low-latency transports beyond websockets.
