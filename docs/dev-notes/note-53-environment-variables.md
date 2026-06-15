# Note 53: Environment Variables

## Summary
Clearly documenting environment variables prevents fragile deployments.

## Implementation Notes
- Maintain a `.env.example` file listing required vars for each service (frontend API URLs, backend secrets, player service ports).
- `.env.example` now includes backend CORS envs—update it whenever new flags such as `FRONTEND_URL_ALLOW_ALL` are added.
- Document default values and acceptable ranges inside `STARTUP_GUIDE.md` with links to this note.
- Use a config loader that validates presence/types at startup and throws descriptive errors when missing.
- Avoid leaking secrets to the frontend by prefixing only safe variables with the framework-specific `REACT_APP_` or equivalent.
- Frontend defaults: treat `REACT_APP_BACKEND_URL` as optional when `REACT_APP_BACKEND_URL_FALLBACK` or the resolver fallback kicks in, and expose toggles such as `REACT_APP_SHOW_BACKEND_URL_BANNER`.
- Backend defaults: `FRONTEND_URL`, optional `FRONTEND_URL_FALLBACK`, and `FRONTEND_URL_ALLOW_ALL` now drive cors behavior; keep them documented across environments.

## Observability
- Log which optional vars are using defaults (without printing actual secret values) for easier debugging.

## Next Steps
- Provide scripts to sync env vars with deployment platforms (Fly.io secrets, Kubernetes secrets) automatically.
- Document rotation procedures for credentials touching blockchain integrations.
