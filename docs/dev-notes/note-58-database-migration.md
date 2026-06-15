# Note 58: Database Migration Strategy

## Summary
Database migrations will be required once we leave the in-memory approach. Document tooling and procedures.

## Implementation Notes
- Adopt a migration tool (Prisma Migrate, Knex, Flyway) and store migration files in version control.
- Run migrations in CI against ephemeral databases to catch syntax errors.
- Tag migrations with semantic versions and include downgrade scripts when feasible.
- Provide a `npm run migrate` script for local dev plus automation in deployment pipelines.

## Observability
- Log migration start/end times, status, and target schema version.
- Alert when migrations take longer than expected or fail mid-run.

## Next Steps
- Document data backup steps prior to running production migrations.
- Plan for zero-downtime techniques (rolling deploys, dual writes) if schema changes are disruptive.
