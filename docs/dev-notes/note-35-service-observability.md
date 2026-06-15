# Note 35: Service Observability

## Summary
Clear observability makes incidents manageable. Document what telemetry each service must emit.

## Implementation Notes
- Adopt a common logger that outputs JSON with request IDs, room codes, and severity.
- Emit Prometheus or StatsD metrics for matchmaking wait time, active rooms, socket counts, and API latency.
- Capture traces for cross-service calls (backend → player service) using OpenTelemetry so we can inspect slow interactions.
- Build dashboards showing core KPIs (active matches, ELO distribution, error rate).

## Observability
- Meta: ensure the observability pipeline itself is monitored (scrape errors, exporter health).

## Next Steps
- Document log retention policies and who has access.
- Provide runbooks linking metrics to mitigation steps.
