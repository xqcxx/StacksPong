# Note 31: Player Service API

## Summary
The player service tracks profiles and ratings. Documenting its API removes guesswork when other components depend on it.

## Implementation Notes
- REST endpoints: `GET /players/top?limit=10`, `GET /players/:name`, `POST /players`, `PATCH /players/:name/rating`.
- Responses should include rating, wins, losses, gamesPlayed, and lastActive timestamps.
- Validate payloads with a schema validator (zod/joi) to prevent malformed data from corrupting in-memory state.
- Support idempotent updates by referencing player names case-insensitively.

## Observability
- Expose request counts, latency, and status-code metrics per endpoint.
- Log validation failures separately to detect abusive traffic.

## Next Steps
- Add pagination to player listing endpoints once data grows.
- Document API versioning strategy before breaking changes.
