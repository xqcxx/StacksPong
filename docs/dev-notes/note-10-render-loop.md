# Note 10: Render Loop

## Summary
The render loop bridges backend tick data and canvas drawing. Capturing the architecture keeps FPS stable and prevents memory leaks.

## Implementation Notes
- Use `requestAnimationFrame` to drive canvas draws; store the RAF ID to cancel on component unmount.
- Maintain the most recent authoritative state from the backend in a ref; the render loop should interpolate between snapshots rather than mutate React state every frame.
- Apply delta timing: compute elapsed time since last frame to keep paddle animations smooth even if the browser throttles.
- Pause rendering when the tab is hidden (Page Visibility API) to save battery and CPU.

## Observability
- Build a lightweight FPS overlay toggle to sample client performance during playtesting sessions.
- Emit metrics for dropped frames vs backend tick count to catch regression when we ship new shaders.

## Next Steps
- Investigate WebGL for future visual upgrades but keep a canvas fallback for compatibility.
- Document memory profiling steps (Performance tab) for long sessions.
