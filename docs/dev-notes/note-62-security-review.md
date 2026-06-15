# Note 62: Security Review Checklist

## Summary
Security reviews should occur before major releases. This checklist ensures consistency.

## Implementation Notes
- Review dependency lists for known vulnerabilities (npm audit, Snyk) and track remediation.
- Revalidate authentication/authorization assumptions even if we currently use usernames only; plan for tokens soon.
- Conduct threat modeling sessions covering websocket abuse, DDoS, injection points, and blockchain integration surfaces.
- Document third-party services and ensure contracts include security obligations.

## Observability
- Keep a register of security findings, severity, and resolution dates.
- Monitor dependency scanning jobs and make failures blocking in CI.

## Next Steps
- Schedule quarterly mini-reviews even without shipping features to reduce drift.
- Document responsible disclosure process for external researchers.
