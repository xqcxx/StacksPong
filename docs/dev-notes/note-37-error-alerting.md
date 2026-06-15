# Note 37: Error Alerting

## Summary
Alert fatigue is real. Documenting alerting rules prevents noisy dashboards while ensuring critical events page humans.

## Implementation Notes
- Define severity levels: Sev1 (outage), Sev2 (degraded), Sev3 (self-healing). Each metric/log should map to a severity.
- Configure alert routes (PagerDuty/Slack) with rate limits and grouping to reduce duplicate notifications.
- Tie alerts to runbooks stored in `docs/runbooks` so responders know immediate steps.
- Include synthetic checks (E2E robots) to verify key flows and alert when they fail.

## Observability
- Track alert counts per day and mean time to acknowledgement/resolution.

## Next Steps
- Review alerts monthly to prune stale rules.
- Add auto-muting windows for planned maintenance.
