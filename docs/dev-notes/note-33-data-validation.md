# Note 33: Data Validation

## Summary
Input validation prevents crashes and security issues. This note defines where validation should happen and the tooling to use.

## Implementation Notes
- Validate client inputs (usernames, room codes) before emitting events to the backend; show inline errors when invalid.
- On the backend, wrap every socket handler with a schema validator (zod/joi) to enforce shapes and lengths.
- Reuse schemas between REST endpoints and websocket events via a shared package.
- Reject invalid data with descriptive error codes rather than silent failures.

## Observability
- Log validation failures separately with anonymized context to spot abuse patterns.
- Track the ratio of rejected requests to successful ones per endpoint.

## Next Steps
- Document canonical schemas in `docs/schemas` once they stabilize.
- Add integration tests that send malformed payloads to verify error codes.
