# Note 07: Input Handling

## Summary
Players interact via keyboard, mouse, or touch. Consolidating how input is normalized prevents jittery paddles and keeps the game loop deterministic.

## Implementation Notes
- Implement an input controller that exposes a unified API (`moveUp`, `moveDown`) regardless of source events; store last intent timestamp for smoothing.
- Use `pointerdown`/`pointermove` events to cover both mouse and touch, but keep keyboard listeners for accessibility.
- Apply throttling so paddle updates from the client do not exceed the backend tick rate; this reduces wasted packets and clamped movement.
- Maintain a `paused` flag so inputs are ignored while countdowns or modals are open.

## Observability
- Log the ratio of inputs per device type to understand adoption and drive prioritization.
- Capture input latency measurements (time between input and render) using `performance.now()` markers around socket emits.

## Next Steps
- Explore predictive smoothing on the client to hide network jitter during paddle movement.
- Document default keybindings and expose a UI for remapping soon after.
