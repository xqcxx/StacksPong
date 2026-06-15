const { HDKey } = require('@scure/bip32');
const {
  mnemonicToSeedSync,
  validateMnemonic
} = require('@scure/bip39');
const { wordlist } = require('@scure/bip39/wordlists/english.js');

const DEFAULT_SIGNING_ACCOUNT_INDEX = 0;

function signingDerivationPath(accountIndex = DEFAULT_SIGNING_ACCOUNT_INDEX) {
  if (!Number.isSafeInteger(accountIndex) || accountIndex < 0) {
    throw new Error('SIGNING_ACCOUNT_INDEX must be a non-negative integer');
  }

  return `m/44'/5757'/0'/0/${accountIndex}`;
}

function validateSigningDerivationPath(path) {
  if (!/^m\/44'\/5757'\/0'\/0\/\d+$/.test(path)) {
    throw new Error(
      "SIGNING_DERIVATION_PATH must use the canonical Stacks path m/44'/5757'/0'/0/{index}"
    );
  }
  return path;
}

function deriveSigningPrivateKey({
  mnemonic,
  derivationPath,
  accountIndex = DEFAULT_SIGNING_ACCOUNT_INDEX,
  passphrase = ''
}) {
  const normalizedMnemonic = mnemonic?.trim().replace(/\s+/g, ' ');
  if (!normalizedMnemonic || !validateMnemonic(normalizedMnemonic, wordlist)) {
    throw new Error('SIGNING_MNEMONIC must be a valid BIP-39 English mnemonic');
  }

  const path = derivationPath
    ? validateSigningDerivationPath(derivationPath.trim())
    : signingDerivationPath(accountIndex);
  const seed = mnemonicToSeedSync(normalizedMnemonic, passphrase);
  const child = HDKey.fromMasterSeed(seed).derive(path);

  if (!child.privateKey) {
    throw new Error(`Unable to derive a private key at ${path}`);
  }

  return {
    derivationPath: path,
    // Stacks transaction signing expects a compressed private key.
    privateKey: `${Buffer.from(child.privateKey).toString('hex')}01`
  };
}

function loadSigningPrivateKey(env = process.env) {
  if (env.SIGNING_MNEMONIC) {
    const accountIndex = env.SIGNING_ACCOUNT_INDEX === undefined
      ? DEFAULT_SIGNING_ACCOUNT_INDEX
      : Number(env.SIGNING_ACCOUNT_INDEX);

    return {
      ...deriveSigningPrivateKey({
        mnemonic: env.SIGNING_MNEMONIC,
        derivationPath: env.SIGNING_DERIVATION_PATH,
        accountIndex,
        passphrase: env.SIGNING_MNEMONIC_PASSPHRASE || ''
      }),
      source: 'mnemonic'
    };
  }

  const privateKey = env.SIGNING_PRIVATE_KEY?.replace(/^0x/, '');
  if (privateKey && privateKey !== 'YOUR_PRIVATE_KEY_HERE') {
    return {
      derivationPath: null,
      privateKey,
      source: 'private-key'
    };
  }

  return null;
}

module.exports = {
  DEFAULT_SIGNING_ACCOUNT_INDEX,
  deriveSigningPrivateKey,
  loadSigningPrivateKey,
  signingDerivationPath,
  validateSigningDerivationPath
};
