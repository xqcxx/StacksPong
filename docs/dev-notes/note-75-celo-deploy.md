# Note 75: Celo Deployment Workflow

## Summary
Document end-to-end deployment process for smart contracts and backend integrations on Celo networks.

## Implementation Notes
- Use Foundry scripts in `blockchain/script/` to deploy to Alfajores (testnet) and mainnet; store RPC URLs and keys in env vars.
- Maintain deployment manifests recording contract addresses, owner keys, and verification status.
- Run `forge verify-contract` or blockscout verification immediately after deploys.
- Update backend `.env` with new contract addresses and restart services that consume them.

## Observability
- Track deployment history (date, git commit, operator) in a simple markdown log.
- Monitor contract events post-deploy to ensure they emit as expected.

## Next Steps
- Automate deployments through CI with manual approvals for mainnet.
- Document rollback steps if a deployment introduces bugs (pause contract, redeploy, migrate state if needed).
