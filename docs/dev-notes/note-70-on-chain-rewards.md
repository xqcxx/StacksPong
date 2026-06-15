# Note 70: On-Chain Rewards

## Summary
Rewarding players with on-chain assets incentivizes participation. Document the flow.

## Implementation Notes
- Define reward triggers (daily wins, tournaments) and map them to contract calls that mint tokens or distribute existing balances.
- Backend signs reward transactions using a hot wallet; queue transactions and retry on transient RPC failures.
- Display pending on-chain rewards in the UI by reading contract state or event logs.
- Keep gas costs reasonable by batching payouts when possible.

## Observability
- Track reward issuance counts and gas spent per day.
- Alert on failed/missing reward transactions to avoid player frustration.

## Next Steps
- Explore rate limits/eligibility rules to prevent farming abuse.
- Document clawback procedures for erroneous payouts.
