const test = require('node:test');
const assert = require('node:assert/strict');
const { createHash } = require('crypto');
const {
  contractPrincipalCV,
  publicKeyFromSignatureRsv,
  serializeCVBytes,
  standardPrincipalCV,
  stringAsciiCV,
  tupleCV,
  uintCV
} = require('@stacks/transactions');

process.env.PONG_CONTRACT_ADDRESS = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
process.env.PONG_CONTRACT_NAME = 'pong-escrow';

const {
  RESULT_REASON_CODES,
  buildResultHash
} = require('../src/services/signatureService');

const result = {
  chainId: 2147483648,
  contractAddress: process.env.PONG_CONTRACT_ADDRESS,
  contractName: process.env.PONG_CONTRACT_NAME,
  roomCode: 'PONG01',
  player1Address: 'ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5',
  player2Address: 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG',
  winnerAddress: 'ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5',
  score1: 5,
  score2: 2,
  resultReason: 'score'
};

test('result proof hashing matches SIP-005 tuple serialization', () => {
  const tuple = tupleCV({
    'chain-id': uintCV(result.chainId),
    contract: contractPrincipalCV(result.contractAddress, result.contractName),
    domain: stringAsciiCV('STACKSPONG_MATCH_RESULT_V1'),
    'room-code': stringAsciiCV(result.roomCode),
    'player-1': standardPrincipalCV(result.player1Address),
    'player-2': standardPrincipalCV(result.player2Address),
    winner: standardPrincipalCV(result.winnerAddress),
    'score-1': uintCV(result.score1),
    'score-2': uintCV(result.score2),
    reason: uintCV(RESULT_REASON_CODES.score)
  });
  const expected = createHash('sha256').update(serializeCVBytes(tuple)).digest('hex');
  assert.equal(buildResultHash(result), expected);
});

test('proof hash changes when authoritative result fields change', () => {
  assert.notEqual(buildResultHash(result), buildResultHash({ ...result, score2: 3 }));
  assert.notEqual(buildResultHash(result), buildResultHash({
    ...result,
    contractName: 'another-escrow'
  }));
});
