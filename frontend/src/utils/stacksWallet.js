function normalizeEntry(raw) {
  if (!raw) return null;
  if (typeof raw === 'string') {
    const match = raw.match(/[ST][TSP][A-Z0-9]{38,}/);
    if (match) return { address: match[0], symbol: 'STX', publicKey: null };
    return null;
  }
  const addr = raw.address || raw.stxAddress || raw.paymentAddr || null;
  if (!addr) return null;
  const looksStacks = /^[ST][TSP]/.test(addr);
  return {
    address: addr,
    symbol: raw.symbol || (looksStacks ? 'STX' : undefined),
    publicKey: raw.publicKey || raw.pubKey || null,
  };
}

function flattenAccounts(accounts) {
  if (!Array.isArray(accounts)) return [];
  return accounts.map(normalizeEntry).filter(Boolean);
}

export function getWalletAddresses(value) {
  if (Array.isArray(value)) return value.map(normalizeEntry).filter(Boolean);
  if (Array.isArray(value?.stx)) return flattenAccounts(value.stx);
  if (Array.isArray(value?.btc)) return [];
  if (Array.isArray(value?.accounts)) return flattenAccounts(value.accounts);
  if (value?.addresses) return getWalletAddresses(value.addresses);
  if (typeof value === 'object' && value !== null) {
    if (value.address) return [normalizeEntry(value)].filter(Boolean);
    if (Array.isArray(value.result)) return flattenAccounts(value.result);
    for (const key of ['stx', 'btc', 'accounts', 'addresses', 'result']) {
      if (value[key] != null) {
        const found = getWalletAddresses(value[key]);
        if (found.length > 0) return found;
      }
    }
  }
  return [];
}

export function selectStxAddress(value) {
  const addresses = getWalletAddresses(value);
  return addresses.find(entry =>
    entry?.symbol === 'STX' || (entry?.address && /^[ST][TSP]/.test(entry.address))
  ) || null;
}
