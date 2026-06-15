# Note 61: CDN Asset Operations

## Summary
Once assets live on a CDN, we need repeatable operations for invalidation and versioning.

## Implementation Notes
- Maintain a manifest mapping asset names to CDN URLs and versions; update during builds.
- Script cache invalidations using CDN APIs (e.g., Cloudflare purge) triggered automatically after deploys.
- Store long-lived assets in versioned directories (e.g., `/v1/audio/`) so old clients can continue referencing them.
- Document fallback URLs or default assets to serve when CDN outages occur.

## Observability
- Track CDN purge success responses and alert on failures.
- Monitor 404 rates on CDN endpoints after releases.

## Next Steps
- Provide manual runbooks for regenerating manifests or re-uploading corrupted files.
- Evaluate signing URLs if we gate certain downloads behind rewards.
