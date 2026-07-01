export function selectStxAddress(userData) {
  if (!userData?.profile?.stxAddress) return null;
  const address = userData.profile.stxAddress.mainnet || userData.profile.stxAddress.testnet;
  if (!address) return null;
  return { address, publicKey: null };
}

export function getStxAddressFromSession(userSession) {
  if (!userSession || !userSession.isUserSignedIn) return null;
  if (!userSession.isUserSignedIn()) return null;
  return selectStxAddress(userSession.loadUserData());
}
