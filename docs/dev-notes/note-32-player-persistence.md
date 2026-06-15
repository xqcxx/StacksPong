# Note 32: Player Persistence

## Summary
Currently the player service uses an in-memory Map. This note outlines paths toward persistent storage.

## Implementation Notes
- Choose a lightweight database (SQLite, Postgres) once persistence is needed; abstract data access through a repository layer so swapping is trivial.
- Implement periodic snapshots of the in-memory map as an interim safety net.
- Consider adding Redis caching when persistent storage arrives to keep leaderboard reads fast.
- Store migrations alongside the player service to keep schema changes versioned.

## Observability
- Track snapshot success/failure and size.
- Monitor database connection pool metrics once we adopt a real database.

## Next Steps
- Evaluate ORMs (Prisma, TypeORM) vs hand-written SQL based on team preference.
- Document backup/restore drills to avoid data loss incidents.
