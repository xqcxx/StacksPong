const test = require('node:test');
const assert = require('node:assert/strict');
const { privateKeyToAddress } = require('@stacks/transactions');
const {
  deriveSigningPrivateKey,
  loadSigningPrivateKey,
  signingDerivationPath
} = require('../src/utils/signingWallet');

const TEST_MNEMONIC =
  'pudding jelly blanket since cruel art dismiss swim divert sibling elbow veteran';

test('uses the canonical Stacks account derivation path', () => {
  assert.equal(signingDerivationPath(0), "m/44'/5757'/0'/0/0");
  assert.equal(signingDerivationPath(7), "m/44'/5757'/0'/0/7");
});

test('derives the Clarinet deployer account from its mnemonic', () => {
  const result = deriveSigningPrivateKey({
    mnemonic: TEST_MNEMONIC,
    accountIndex: 0
  });

  assert.equal(result.derivationPath, "m/44'/5757'/0'/0/0");
  assert.equal(
    privateKeyToAddress(result.privateKey, 'testnet'),
    'ST3FJ846B6F0DE0SKZE8JAYJMMFRR1EPCQE9FN7P0'
  );
});

test('accepts an explicit canonical derivation path', () => {
  const result = loadSigningPrivateKey({
    SIGNING_MNEMONIC: TEST_MNEMONIC,
    SIGNING_DERIVATION_PATH: "m/44'/5757'/0'/0/1"
  });

  assert.equal(result.source, 'mnemonic');
  assert.equal(result.derivationPath, "m/44'/5757'/0'/0/1");
});

test('rejects non-Stacks derivation paths', () => {
  assert.throws(
    () => deriveSigningPrivateKey({
      mnemonic: TEST_MNEMONIC,
      derivationPath: "m/44'/60'/0'/0/0"
    }),
    /canonical Stacks path/
  );
});
