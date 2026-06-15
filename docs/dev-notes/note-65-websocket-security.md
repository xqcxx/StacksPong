# Note 65: WebSocket Security

## Summary
Websockets need extra care because they bypass some HTTP protections. Document safeguards.

## Implementation Notes
- Enforce origin checks and optionally token-based auth during the Socket.IO handshake.
- Rate-limit events like `joinRoom`, `findRandomMatch`, and chat once implemented.
- Validate payload lengths to avoid memory DoS; reject messages above a safe threshold.
- Use TLS everywhere and pin dependencies to avoid known CVEs in socket libraries.

## Observability
- Track rejected handshakes, invalid origin attempts, and payloads exceeding limits.

## Next Steps
- Consider message signing for high-stakes commands if wallets or currency transfers become involved.
- Document rotation of any shared secrets used for signing.
