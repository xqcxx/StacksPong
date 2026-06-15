# Note 36: Log Aggregation

## Summary
Centralized logs speed up debugging. Document tooling decisions and structure requirements.

## Implementation Notes
- Ship logs to a hosted stack (Loki, ELK) via Fluent Bit or Vector sidecars defined in Docker compose.
- Enforce structured JSON fields: `service`, `roomCode`, `player`, `event`, `latencyMs`.
- Keep log levels consistent (`debug`, `info`, `warn`, `error`) and avoid logging PII.
- Provide grepable request IDs that propagate from frontend (if available) through backend logs.

## Observability
- Monitor ingestion lag and dropped log counts from the shipper to catch pipeline issues.

## Next Steps
- Document retention (e.g., 7 days hot, 30 days cold) and export process for audits.
- Provide a dashboard with saved queries for common incidents.
