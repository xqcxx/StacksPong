# Note 34: API Rate Limits

## Summary
Rate limiting protects services from abuse. Document target limits for REST and websocket endpoints.

## Implementation Notes
- For REST: apply per-IP and per-API key limits using middleware like `express-rate-limit`; start with 60 req/min for player lookups.
- For Socket.IO: limit matchmaking events (create/join) per socket with sliding window counters; emit warnings before closing sockets.
- Store rate-limit counters in Redis if we scale horizontally.
- Expose headers (`X-RateLimit-Remaining`) for REST endpoints to help clients behave.

## Observability
- Track rate-limit hits per endpoint and alert if legitimate users frequently hit the ceiling.
- Monitor top offending IPs or usernames to feed trust & safety.

## Next Steps
- Document procedures for temporarily raising limits during tournaments.
- Provide admin tooling to whitelist trusted partners.
