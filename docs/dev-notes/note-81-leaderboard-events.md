# Note 81 – Leaderboard Event Contract

## Context

- The Welcome screen subscribes to `rankingsUpdate` for live leaderboard pushes.
- The reworked multiplayer handler emits `leaderboardUpdate`, so sockets never deliver data.
- Both handlers currently run side-by-side which makes the mismatch inconsistent.

## Goals

- Declare a canonical socket event name for leaderboard pushes.
- Provide a compatibility layer long enough to migrate every client.
- Document the wire contract so future handlers emit/listen consistently.

## Chosen Contract

- Canonical outbound event: `leaderboardUpdate`
- Legacy alias kept temporarily: `rankingsUpdate`
- Request event from client: `getLeaderboard`
- Payload: Array of `{ name, rating, wins, losses }`
- Slice: Respect `LEADERBOARD_LIMIT` so clients receive the same payload size regardless of transport.

## Compatibility Plan

1. Emit both `leaderboardUpdate` and `rankingsUpdate` on the backend.
2. Update the frontend to listen to both while logging deprecation warnings.
3. Remove the legacy event when telemetry confirms there are zero references.
