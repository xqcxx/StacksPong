import { getWalletAddresses, selectStxAddress } from './stacksWallet';

const stxAccount = {
  address: 'ST1C87AXAV2W92Q4X2TN4C77G7EDNP35JMEHEY9WZ',
  symbol: 'STX',
  publicKey: '03abc'
};

test('selects an STX account from a fresh wallet response', () => {
  expect(selectStxAddress({
    addresses: [
      { address: 'tb1qexample', publicKey: '02btc' },
      { address: stxAccount.address, publicKey: stxAccount.publicKey }
    ]
  })).toEqual({
    address: stxAccount.address,
    symbol: stxAccount.symbol,
    publicKey: stxAccount.publicKey
  });
});

test('selects an STX account from Connect local storage', () => {
  const storage = {
    addresses: {
      stx: [{ address: stxAccount.address, publicKey: stxAccount.publicKey }],
      btc: [{ address: 'tb1qexample' }]
    }
  };

  expect(getWalletAddresses(storage)).toEqual([stxAccount]);
  expect(selectStxAddress(storage)).toEqual(stxAccount);
});

test('treats malformed or empty wallet storage as disconnected', () => {
  expect(selectStxAddress(null)).toBeNull();
  expect(selectStxAddress({ addresses: {} })).toBeNull();
});
