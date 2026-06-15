# Note 03: Socket Connection Lifecycle

## Summary
Reliable gameplay hinges on a predictable Socket.IO lifecycle. This note captures how the frontend establishes the connection, manages auth metadata, and reacts to disconnect/reconnect events so we can plug telemetry and user messaging in the right spots.

## Implementation Notes
- Wrap socket initialization inside a React hook so only one Socket.IO client lives through the app lifecycle; reusing prevents duplicate listeners.
- Maintain explicit states: `connecting`, `connected`, `disconnected`, `reconnecting`. Surface them in the UI to keep players informed.
- When a disconnect occurs, emit a lightweight status ping to the backend once connectivity resumes to reclaim rooms before the default timeout kicks in.
- Ensure event listeners are cleaned up when components unmount to avoid leaking handlers during route swaps.

## Observability
- Count connect/disconnect/reconnect events per minute and segment by platform (desktop/mobile) through custom headers.
- Log connection errors with the transport used (`websocket`, `polling`) to understand downgrade rates behind proxies.

## Next Steps
- Investigate attaching auth tokens in the handshake query if/when authentication is added.
- Consider exposing connection state to the leaderboard component so it can pause updates gracefully during network hiccups.
