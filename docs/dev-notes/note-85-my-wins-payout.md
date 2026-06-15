# Note 85 – My Wins Prize Payout

## Context

- `MyWins` reads `stakeAmount` from `/games/my-wins`.
- UI shows `stakeAmount` as “Prize Amount”, but winner actually receives `stakeAmount * 2`.
- Under-reporting rewards confuses players and erodes trust in staked mode.

## Goals

- Display the full payout (2× stake) everywhere the UI references prize totals.
- Introduce a formatter that can safely double numeric strings without floating-point loss.
- Document the logic so future contributors avoid repeating the bug.
- Surface aggregate claimable/claimed totals so the benefit is obvious at a glance.
- Provide helper utilities (`computePrizeFromStake`, `sumWei`) for future payout work.
- Keep `PRIZE_MULTIPLIER` defined in `frontend/src/constants.js` in sync with backend economics.
- Helpers now expose the multiplier so UI labels automatically match configuration.

## Proposed Steps

1. Add a helper that accepts `stakeAmount` (string/number) and returns `{stakeAmount, payout, formatted}`.
2. Update `MyWins` to use the helper for the “Prize Amount” row.
3. Extend documentation (README + CSS note) to reflect the payout logic.

## Observability

- Log payout calculations in dev builds if parsing fails.
- Consider surfacing stake vs payout in analytics events for My Wins usage.

## Next Steps

- Backfill historical wins with explicit `payoutAmount` to avoid recomputing from `stakeAmount`.
- Localize the new `stake ×2` label for non-English builds.
- Wire payout totals into analytics to understand total ETH pending claims.
