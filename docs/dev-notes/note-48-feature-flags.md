# Note 48: Feature Flags

## Summary
Feature flags allow gradual rollouts. Document the plan to avoid ad-hoc booleans.

## Implementation Notes
- Introduce a `featureFlags.js` config that reads values from env vars or remote config services.
- Provide a React hook (`useFeatureFlag`) and a backend helper to read flags consistently.
- Support percentage rollouts for experiments by hashing player IDs/usernames.
- Keep flag metadata (owner, expiry date) in a registry to ensure cleanup.

## Observability
- Track exposure metrics per flag: number of users in control vs treatment.
- Log when flags override default values at runtime for auditing.

## Next Steps
- Evaluate open-source flag platforms (Unleash, GrowthBook) if self-managed switches become unwieldy.
- Document kill switch procedures for problematic releases.
