# Note 51: Deployment Docker

## Summary
Docker images underpin local dev and deployments. Outline build targets and optimizations.

## Implementation Notes
- Maintain separate Dockerfiles for frontend, backend, and player service; use multi-stage builds to keep images slim.
- Pin base image versions (Node, nginx) and run security updates as part of the build.
- Cache dependencies effectively by copying package manifests before the rest of the source.
- Provide a `docker-compose.prod.yml` that mirrors production topology for smoke tests.

## Observability
- Track image sizes and build durations in CI.
- Scan images with Trivy/Grype to catch vulnerabilities pre-deploy.

## Next Steps
- Document best practices for running containers with non-root users.
- Add automated rebuilds when base images receive security patches.
