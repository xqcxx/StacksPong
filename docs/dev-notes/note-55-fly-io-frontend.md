# Note 55: Fly.io Frontend Deployment

## Summary
The frontend ships via Fly.io (`frontend/fly.toml`). Document deployment steps and gotchas.

## Implementation Notes
- Build the static bundle (`npm run build`) and let Fly’s builder serve it with a lightweight server (e.g., `serve` or custom Node/Express).
- Configure Fly secrets for backend API URLs and analytics keys; ensure env vars map to `REACT_APP_` prefix at build time.
- Use multiple Fly regions close to players; enable auto-scaling based on concurrent connections.
- Keep `fly.toml` in sync with actual ports and health checks; run `fly deploy --remote-only` from CI with versioned images.

## Observability
- Monitor Fly metrics (requests, latency, error rate) via Grafana/Prometheus integration.
- Log release IDs per deploy so we can roll back to the previous Fly image quickly.

## Next Steps
- Document DNS + CDN integration for custom domains.
- Cache static assets aggressively via Fly Machines or CDN edge caches.
