# Note 77: Mainnet Readiness Checklist

## Summary
Before going live on Celo mainnet, run through this checklist to avoid disasters.

## Implementation Notes
- Complete security audits of smart contracts and critical backend components.
- Verify all env vars point to mainnet RPCs and contract addresses; double-check reward wallet balances.
- Run load tests mimicking peak expected traffic using pre-recorded scenarios.
- Prepare legal/compliance sign-off (KYC/AML) if tokens carry value.

## Observability
- Establish 24/7 paging rotations during launch week with clear escalation paths.
- Ensure dashboards/alerts cover all core KPIs prior to flipping the switch.

## Next Steps
- Document rollback triggers and communication plan for stakeholders if something goes wrong.
- Schedule a dry run (“day in the life”) on testnet to rehearse operations.
