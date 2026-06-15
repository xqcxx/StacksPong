/* global BigInt */
export function stxToMicroStx(value) {
  const [whole = '0', fraction = ''] = String(value).trim().split('.');
  const micro = `${fraction}000000`.slice(0, 6);
  return BigInt(whole || '0') * 1_000_000n + BigInt(micro || '0');
}

export function microStxToStx(value) {
  return (Number(value || 0) / 1_000_000).toString();
}
