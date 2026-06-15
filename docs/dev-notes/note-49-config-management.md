# Note 49: Config Management

## Summary
Configuration sprawl leads to mistakes. Document how to manage settings safely.

## Implementation Notes
- Store defaults in versioned files (`config/default.json`) and overlay environment-specific values via env vars.
- Use dotenv for local dev but never commit secrets; reference `STARTUP_GUIDE.md` for required keys.
- Validate config on startup, failing fast when essential values are missing.
- Provide a CLI command that prints effective config (with secrets masked) for debugging.

## Observability
- Log config version hashes at boot time for traceability.
- Track config reload events if hot-reload is supported.

## Next Steps
- Evaluate HashiCorp Vault or SSM for secret distribution when deploying to cloud environments.
- Document approval workflows for config changes in production.
