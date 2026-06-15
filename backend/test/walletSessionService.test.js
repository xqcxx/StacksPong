const test = require('node:test');
const assert = require('node:assert/strict');
const {
  getAddressFromPrivateKey,
  privateKeyToPublic,
  publicKeyToHex,
  signStructuredData
} = require('@stacks/transactions');

process.env.STACKS_NETWORK = 'testnet';
process.env.STACKS_CHAIN_ID = '2147483648';

const {
  structuredPayload,
  verifySip018
} = require('../src/services/walletSessionService');

const privateKey =
  '8f2a5594904a34d4f1c2a48116af8f3520f29056dfd932f64f2a8e0aaf773b701';
const walletAddress = getAddressFromPrivateKey(privateKey, 'testnet');
const publicKey = publicKeyToHex(privateKeyToPublic(privateKey));

test('verifies SIP-018 ownership of a Stacks principal', () => {
  const challenge = 'abc123';
  const payload = structuredPayload(walletAddress, challenge);
  const signature = signStructuredData({
    ...payload,
    privateKey
  });
  assert.equal(verifySip018({
    walletAddress,
    challenge,
    signature,
    publicKey,
    action: 'authenticate'
  }), publicKey);
});

test('rejects a SIP-018 signature bound to another challenge', () => {
  const payload = structuredPayload(walletAddress, 'first');
  const signature = signStructuredData({ ...payload, privateKey });
  assert.throws(() => verifySip018({
    walletAddress,
    challenge: 'second',
    signature,
    publicKey,
    action: 'authenticate'
  }), /signature/i);
});
