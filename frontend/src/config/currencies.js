export const CURRENCIES = {
  STX: {
    key: 'STX',
    symbol: 'STX',
    name: 'Stacks (Native)',
    tokenAddress: null,
    decimals: 6,
    color: '#5546ff',
    isNative: true,
    icon: '⬡',
    presets: [0.1, 0.5, 1, 5, 10, 25, 50, 100]
  }
};

export const CURRENCY_LIST = [CURRENCIES.STX];
export const FEE_CURRENCIES = { STX: { symbol: 'STX', address: null, adapter: null } };
export const isNativeToken = () => true;
export const getFeeCurrencyAddress = () => null;
