# Note 40: Disconnection Handling

## Summary
Disconnects happen; we need a predictable experience.

## Implementation Notes
- Detect `disconnect` events on the backend and mark affected rooms as `waiting` while giving the remaining player a reason message.
- Send periodic `stillWaiting` events to the connected client with countdown timers before a forfeit occurs.
- Cache last known input from disconnected players to resume quickly if they return.
- Provide UI overlays that inform both players of the situation to reduce rage quits.

## Observability
- Track disconnect causes (network, heartbeat timeout, manual leave) separately.
- Monitor for spikes per ISP/region to correlate with outages.

## Next Steps
- Document policies for awarding wins/losses after repeated disconnects.
- Explore partial bot takeover so the remaining player can keep practicing.
