# Note 04: Username Persistence

## Summary
Usernames currently live in localStorage on the frontend and are echoed to the backend to identify players in leaderboard calls. This document lays out the lifecycle so we can later migrate to proper identities without breaking backward compatibility.

## Implementation Notes
- `Welcome` component prompts for a username, stores it under a dedicated key, and passes it through every matchmaking event.
- On the backend, the username is trusted blindly; add a normalization helper (trim, uppercase first letter, length clamp) before persistence in the player service.
- Propagate the normalized value back to the client via `gameStart` so the UI always displays the canonical form even if the user typed mixed casing.
- When adding authentication later, treat the stored username as only a display name and decouple from unique identifiers.

## Observability
- Track the number of empty or rejected usernames to catch regressions in validation logic.
- Create a simple audit log entry when two different sockets reuse the same normalized username within a short interval to flag impersonation attempts.

## Next Steps
- Provide inline validation feedback (length, allowed characters) to avoid server-side rejections.
- Consider migrating storage to IndexedDB if we start storing richer player profiles client-side.
