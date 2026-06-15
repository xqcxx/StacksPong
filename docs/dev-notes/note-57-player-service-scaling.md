# Note 57: Player Service Scaling

## Summary
Even the simple player service needs a scaling story once persistence arrives.

## Implementation Notes
- Convert the in-memory map to a proper database-backed service; use connection pooling and caching.
- Introduce read replicas for leaderboard queries to avoid overloading primaries.
- Add request throttling per client to stop abusive patterns.
- Provide horizontal scaling by running multiple stateless API instances when the DB is externalized.

## Observability
- Track query latency and cache hit rate.
- Monitor DB connection saturation to know when to upgrade.

## Next Steps
- Plan for schema migrations without downtime (see note 58).
- Document failover playbook when the database becomes unavailable.
