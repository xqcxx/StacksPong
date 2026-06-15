const test = require('node:test');
const assert = require('node:assert/strict');
const {
  buildClaimSummary,
  buildHistoryQuery,
  toHistoryGame
} = require('../src/utils/gameHistory');

const wallet = 'ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5';
const escrow = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';

test('claim filters require wins and a valid wallet', () => {
  assert.throws(
    () => buildHistoryQuery({ playerName: 'praise', claimStatus: 'claimable' }),
    /valid wallet/
  );

  const query = buildHistoryQuery({
    playerName: 'praise',
    filter: 'wins',
    claimStatus: 'claimable',
    walletAddress: wallet,
    escrowAddress: escrow
  });
  assert.equal(query.claimed, false);
  assert.equal(query.isStaked, true);
  assert.equal(query.winnerAddress, wallet);
  assert.equal(query.escrowAddress, escrow);
});

test('claim summaries are grouped by currency and ignore legacy matches', () => {
  const base = {
    isStaked: true,
    winnerAddress: wallet,
    escrowAddress: escrow,
    resultSignature: '0xproof',
    stakeAmountMicroStx: '2000000'
  };
  const summary = buildClaimSummary([
    { ...base, stakeCurrency: 'STX', claimed: false },
    { ...base, stakeCurrency: 'STX', claimed: true },
    { ...base, escrowAddress: null, claimed: false },
    { ...base, escrowAddress: 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG', claimed: false }
  ], wallet, escrow);

  assert.deepEqual(summary.STX, {
    claimable: 4,
    claimed: 4,
    total: 8,
    claimableCount: 1,
    claimedCount: 1
  });
});

test('history marks old staked records as legacy', () => {
  const transformed = toHistoryGame({
    isStaked: true,
    player1: { name: 'praise' },
    player2: { name: 'rival' },
    winner: 'player1',
    score: { player1: 5, player2: 2 }
  }, 'praise', escrow);

  assert.equal(transformed.legacyMatch, true);
  assert.equal(transformed.result, 'win');
  assert.equal(transformed.finalScore, '5-2');
});
