# Note 52: Compose Networking

## Summary
Docker Compose glues services locally. Document the network topology to avoid misconfiguration.

## Implementation Notes
- Use a dedicated bridge network (`app-network`) so containers resolve each other by service name.
- Expose only necessary ports to the host: frontend (3000), backend (8080), player service (5001), blockchain RPCs as needed.
- Configure healthchecks for each service to help `depends_on` wait for readiness.
- Provide `.env.docker` with overrides for containerized runs (e.g., service URLs pointing to internal names instead of localhost).

## Observability
- Log container restarts and reasons using `docker compose ls` and integrate with local scripts.

## Next Steps
- Document how to attach to networks when adding optional services (Redis) in the future.
- Consider Compose profiles to start only subsets (e.g., frontend-only) during development.
