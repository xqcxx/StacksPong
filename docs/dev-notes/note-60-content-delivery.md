# Note 60: Content Delivery

## Summary
Static assets (images, audio, fonts) need a reliable delivery path. Document CDN strategy.

## Implementation Notes
- Host built frontend assets behind a CDN (Cloudflare, Fastly) with caching rules tuned for hashed filenames.
- Serve screenshots and marketing assets from the same bucket but with longer cache lifetimes.
- Use gzip/brotli compression at the edge and ensure correct content types.
- Provide cache-busting strategy for files without hashes (music) by appending version query params.

## Observability
- Monitor CDN hit ratio and origin response times.
- Track asset download failures segmented by region.

## Next Steps
- Document purge procedures when emergency fixes require cache invalidation.
- Consider serving blockchain metadata or leaderboard snapshots via the CDN for faster loads.
