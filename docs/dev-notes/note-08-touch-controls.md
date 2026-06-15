# Note 08: Touch Controls

## Summary
Touch controls unlock mobile browsers; this note explains how to keep latency low and gestures intuitive.

## Implementation Notes
- Prefer `pointerevents` but fall back to touch events for Safari; detect support once and store the handler set.
- Implement relative movement: track the initial finger position, translate deltas into paddle velocity, and clamp values to avoid jumps.
- Provide haptic feedback (via `navigator.vibrate`) on scoring to keep mobile players engaged.
- Disable passive listeners when we need to `preventDefault` to stop the page from scrolling in landscape mode.

## Observability
- Track the share of players flagged as touch users and correlate with win rates to evaluate parity with keyboard users.
- Log gesture cancel events to highlight UX pain points (e.g., accidental swipes triggering browser UI).

## Next Steps
- Add a tutorial overlay explaining swipe zones for first-time touch users.
- Experiment with virtual buttons as an alternative for players who prefer discrete inputs.
