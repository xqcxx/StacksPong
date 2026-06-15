# Note 50: Versioning

## Summary
Versioning ensures releases are traceable. Document tagging and semantic versioning expectations.

## Implementation Notes
- Adopt semantic versioning (MAJOR.MINOR.PATCH) across services; maintain a `CHANGELOG.md` summarizing user-impacting changes.
- Tag releases in Git matching the version number and include Docker image tags.
- Automate version bumps through CI once tests pass to avoid manual errors.
- Store protocol versions between frontend and backend to ensure compatibility checks on connect.

## Observability
- Log running version numbers on service startup and include them in health responses.

## Next Steps
- Document rollback procedures referencing the version matrix.
- Evaluate release channels (canary/stable) for faster iteration.
