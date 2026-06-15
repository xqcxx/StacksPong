export function getWalletAddresses(value) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.stx)) return value.stx;
  if (value?.addresses) return getWalletAddresses(value.addresses);
  return [];
}

export function selectStxAddress(value) {
  const addresses = getWalletAddresses(value);
  return addresses.find(entry =>
    entry?.symbol === 'STX' || entry?.address?.startsWith('S')
  ) || null;
}
