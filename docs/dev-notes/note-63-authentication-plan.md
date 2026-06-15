# Note 63: Authentication Plan

## Summary
Authentication is currently absent, but we should define the roadmap.

## Implementation Notes
- Start with passwordless magic links or wallet-based auth to avoid storing passwords; evaluate Auth0, Supabase, or custom wallet login.
- Issue JWTs or session tokens that the backend validates before allowing matchmaking or leaderboard writes.
- Map authenticated identities to display names; keep them decoupled so players can rename themselves without losing stats.
- Provide logout, token refresh, and inactivity expiration policies.

## Observability
- Track login success/failure rates and reasons (invalid link, expired token).
- Monitor token issuance to detect anomalies or brute-force attempts.

## Next Steps
- Document migration plan for existing anonymous stats when auth goes live.
- Consider optional guest mode with limited features to preserve quick onboarding.
