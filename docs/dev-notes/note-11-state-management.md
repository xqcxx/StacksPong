# Note 11: State Management

## Summary
React state needs to stay predictable despite real-time updates. This note defines what lives in React state vs refs vs context to keep renders cheap.

## Implementation Notes
- Store UI-only data (modal visibility, button states) in component state, but keep gameplay data inside refs tied to the socket layer.
- Provide a global `GameSessionContext` that exposes username, connection state, and score summary so nested components do not prop-drill.
- Use Zustand or Redux Toolkit if the data graph grows complex; until then, leverage context + reducers for clarity.
- Ensure state resets happen on unmount/route change to avoid stale scores appearing when a new match begins.

## Observability
- Add React DevTools profiling instructions for contributors to inspect unnecessary renders.
- Track the number of context providers and highlight when they start to duplicate responsibilities.

## Next Steps
- Document conventions for asynchronous state updates (use functional updates) to prevent race conditions with socket events.
- Evaluate writing unit tests around reducers once they exist.
