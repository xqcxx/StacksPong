# Note 21: Server Bootstrap

## Summary
Documenting backend bootstrap clarifies where to add middleware, health checks, and worker clustering.

## Implementation Notes
- `backend/src/server.js` initializes Express and attaches Socket.IO; keep the initialization order consistent (env load → logging → middleware → routes → sockets).
- Expose `/healthz` returning status of dependencies (player service, blockchain) before binding event handlers.
- Consider clustering using Node’s `cluster` module or PM2 once CPU saturation becomes an issue; document port coordination with Socket.IO sticky sessions.
- Encapsulate dependency wiring (player service client, leaderboard manager) inside a `createServer()` factory for easier testing.

## Observability
- Track boot duration and emit logs once the server is ready to accept sockets.
- Add process-level metrics (heap, event loop lag) at bootstrap to catch resource leaks early.

## Next Steps
- Document how to run the backend in watch mode using `nodemon` or `tsx` for faster iteration.
- Build integration tests that spin up the server in-memory for smoke validation.
