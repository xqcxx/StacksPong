# Note 38: Performance Profiling

## Summary
Performance profiling guides optimization work. This note outlines profiling tools for frontend and backend.

## Implementation Notes
- Frontend: use Chrome Performance Recorder to capture frame timelines while playing; document how to spot long tasks.
- Backend: run Node’s built-in CPU/heap profiler (`--inspect --prof`) during load tests to identify hotspots.
- Provide scripts that capture flamegraphs and commit them to a profiling directory for historical comparison.
- Profile socket emit rates and payload sizes when experimenting with new features.

## Observability
- Store key profiling metrics (avg CPU, memory, FPS) after each release to track regressions.

## Next Steps
- Automate weekly performance benchmarks to catch drift.
- Share profiling tutorials for contributors unfamiliar with the tooling.
