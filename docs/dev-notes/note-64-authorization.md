# Note 64: Authorization

## Summary
Once auth exists, we need authorization rules. Document intended roles and enforcement points.

## Implementation Notes
- Define roles: player, moderator, admin. Store them in the player service or an auth provider.
- Implement middleware that checks permissions before executing sensitive actions (e.g., banning players, editing tournaments).
- Tag socket connections with role info so event handlers can enforce limits without extra lookups.
- Provide a centralized policy file describing which roles can call which endpoints/events.

## Observability
- Log authorization failures with anonymized context to detect intrusion attempts.
- Track role distribution to know how many privileged users exist.

## Next Steps
- Document escalation and approval process for granting elevated roles.
- Add integration tests that ensure unauthorized actors receive correct error codes.
