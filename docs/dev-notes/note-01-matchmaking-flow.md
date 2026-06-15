# Note 01: Matchmaking Flow

## Summary
Document the current quick-match handshake so future UI tweaks do not break socket expectations. The flow ties the React `Welcome` component, the Socket.IO `findRandomMatch` emit, and the backend room allocation in `backend/src/multiplayerHandler.js`.

## Implementation Notes
- Username is read from localStorage, validated, and embedded in the payload sent to the backend through `socket.emit('findRandomMatch', playerData)`.
- The backend queues the player, pairs them when a second player arrives, and allocates a transient room via `roomManager.createRandomMatchRoom()`.
- Once both players are paired, the backend emits `gameStart` with the room code and initial game snapshot; the frontend transitions into `MultiplayerGame`.
- Abandoned queue entries must be cleaned up; the handler currently checks for socket disconnects but we should add a timeout guard.

## Observability
- Instrument the matchmaking queue depth and wait time as metrics exported to a `/metrics` endpoint or StatsD.
- Log the cycle from `findRandomMatch` to the first `gameUpdate` with correlation IDs to spot slow pairings.
- Emit a structured warning whenever a player waits longer than X seconds so alerts can be attached later.

## Next Steps
- Consider prioritised queues (friends first, ranked tiers) once the baseline wait-time objective is met.
- Model timeouts explicitly so clients receive a `matchTimeout` event rather than guessing from silence.
