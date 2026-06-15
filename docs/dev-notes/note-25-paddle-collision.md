# Note 25: Paddle Collision

## Summary
Accurate paddle collisions maintain fairness. This note lists our approach and how to avoid tunneling issues at high speeds.

## Implementation Notes
- Represent paddles and ball as rectangles/circles with bounding boxes updated each tick.
- Use swept collision detection (predict ball position using velocity) so fast-moving balls do not pass through paddles.
- Apply a small overlap threshold to avoid stuttering when collisions happen near the edges.
- When computing bounce angles, consider the contact point relative to paddle center and clamp extremes.

## Observability
- Log mismatch events where client predicted hits but the server recorded misses; these highlight drift or lag.
- Track the number of collisions per rally to understand pacing.

## Next Steps
- Build a debug overlay (server optional) to visualize hitboxes for quicker tuning.
- Document how spin (note 26) interacts with collision results.
