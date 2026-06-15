# Note 56: Backend Scaling

## Summary
Scaling the backend ensures smooth matches during surges.

## Implementation Notes
- Vertical scaling: monitor CPU/memory and increase container size until diminishing returns.
- Horizontal scaling: run multiple backend instances behind a load balancer with sticky sessions to keep sockets on the same node.
- Use Redis or another shared store for room metadata if horizontal scaling is enabled.
- Automate scaling via metrics (active rooms, CPU) but keep manual override hooks.

## Observability
- Track active rooms per instance to detect imbalance.
- Monitor socket disconnect spikes during scale events.

## Next Steps
- Document blue/green deployment strategy to roll out new backend versions without dropping players.
- Evaluate Kubernetes or Fly Machines for multi-region scaling.
