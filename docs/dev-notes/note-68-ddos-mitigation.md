# Note 68: DDoS Mitigation

## Summary
DDoS attacks can target websockets or HTTP endpoints. Document baseline defenses.

## Implementation Notes
- Place the stack behind a CDN/WAF (Cloudflare, Cloud Armor) that can absorb volumetric attacks.
- Rate-limit connection attempts per IP and enforce SYN flood protections at the load balancer.
- Keep stateless health endpoints separate from heavy logic so DDoS filters can probe easily.
- Prepare infrastructure-as-code scripts to scale frontends quickly during an attack.

## Observability
- Monitor connection attempts, drop counts, and WAF rule hits.
- Set up alerting when network-level metrics exceed historical baselines.

## Next Steps
- Document coordination steps with hosting providers during a major attack.
- Run tabletop exercises to practice failover and communication.
