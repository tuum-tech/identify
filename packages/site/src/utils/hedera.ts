export const isIn = <T>(values: readonly T[], value: any): value is T => {
  return values.includes(value);
};

const hederaChainIDs = new Map([
  ['0x127', 'mainnet'],
  ['0x128', 'testnet'],
  ['0x129', 'previewnet'],
  ['0x12a', 'localnet'],
]);

export const getHederaNetwork = (chainId: string): string => {
  const network = hederaChainIDs.get(chainId);
  return network || 'mainnet';
};

export const validHederaChainID = (x: string) =>
  isIn(Array.from(hederaChainIDs.keys()), x);

const chainIDs = new Map([
  ['0x1', 'Ethereum Mainnet'],
  ['0x5', 'Goerli test network'],
]);

export const getNetwork = (chainId: string): string => {
  if (validHederaChainID(chainId)) {
    return `Hedera ${getHederaNetwork(chainId)}`;
  }
  return chainIDs.get(chainId) || '';
};
