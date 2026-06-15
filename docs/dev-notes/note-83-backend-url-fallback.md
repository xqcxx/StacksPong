# Note 83 – Backend URL Fallback

## Problem

- The frontend relies on `REACT_APP_BACKEND_URL`.
- When the variable is undefined (fresh clones, codespaces), `BACKEND_URL` becomes `undefined`.
- Socket clients instantiated with `undefined` throw before connecting to localhost.

## Desired Behavior

- Provide a sane default (e.g., same origin or `http://localhost:8080`) when env config is absent and allow `REACT_APP_BACKEND_URL_FALLBACK` to override it during special setups.
- Export `DEFAULT_BACKEND_URL` from the resolver module for reuse in docs/tests.
- Surface a console warning so devs know to configure the variable in production builds.
- Avoid runtime crashes by validating URLs before use.
- Track the source (env/location/fallback) for observability and future telemetry.
- Expose the resolved URL & source via `useBackendUrl` for UI components/banners.
- Use `readBooleanEnv` when introducing new toggles tied to backend resolution UX.
