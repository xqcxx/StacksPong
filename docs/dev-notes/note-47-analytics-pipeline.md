# Note 47: Analytics Pipeline

## Summary
Analytics inform product decisions. Document key events and pipelines.

## Implementation Notes
- Track core events: matchmaking start, match start, match end, disconnect, rematch click.
- Use a lightweight event collector (Segment, PostHog) that batches events from the frontend; include anonymized user IDs.
- On the backend, send server-side events for authoritative outcomes to avoid client spoofing.
- Define schemas for each event and store them in `docs/analytics/events.json` later.

## Observability
- Monitor ingestion success rates and queue depth in the analytics tool.
- Compare client vs server counts to detect drops.

## Next Steps
- Add funnels/dashboards for onboarding and retention.
- Document data retention and privacy policy compliance.
