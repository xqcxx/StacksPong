import { selectStxAddress } from './stacksWallet';

const userData = {
  profile: {
    stxAddress: {
      mainnet: 'SP132G3N7H1Y0VJVZGTHFBMEY5VZZY6WWN7DM3FPT',
      testnet: 'ST1C87AXAV2W92Q4X2TN4C77G7EDNP35JMEHEY9WZ'
    }
  }
};

test('selects mainnet STX address from UserSession userData', () => {
  const result = selectStxAddress(userData);
  expect(result).toEqual({
    address: 'SP132G3N7H1Y0VJVZGTHFBMEY5VZZY6WWN7DM3FPT',
    publicKey: null
  });
});

test('selects testnet STX address when mainnet is absent', () => {
  const testnetOnly = {
    profile: {
      stxAddress: {
        testnet: 'ST1C87AXAV2W92Q4X2TN4C77G7EDNP35JMEHEY9WZ'
      }
    }
  };
  const result = selectStxAddress(testnetOnly);
  expect(result).toEqual({
    address: 'ST1C87AXAV2W92Q4X2TN4C77G7EDNP35JMEHEY9WZ',
    publicKey: null
  });
});

test('returns null when userData lacks stxAddress', () => {
  expect(selectStxAddress(null)).toBeNull();
  expect(selectStxAddress({})).toBeNull();
  expect(selectStxAddress({ profile: {} })).toBeNull();
  expect(selectStxAddress({ profile: { stxAddress: {} } })).toBeNull();
});
