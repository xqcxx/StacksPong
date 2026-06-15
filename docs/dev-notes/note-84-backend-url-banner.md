# Note 84 – Backend URL Banner

## Purpose
- Display which backend URL/source the frontend resolved during development.
- Reduce confusion when sockets silently point to the wrong environment.

## Behavior
- Controlled via `REACT_APP_SHOW_BACKEND_URL_BANNER` (defaults to `true` in non-production builds).
- Reads data from `useBackendUrl`, ensuring banner stays consistent with the resolver.
- Hidden automatically in production builds.
- Tagged with `data-testid="backend-url-banner"` for potential UI tests.

## Future Ideas
- Link to `/health` endpoint for quick checks.
- Allow copying the URL to clipboard for debugging.
