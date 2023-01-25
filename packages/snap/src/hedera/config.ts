import { isIn } from '../types/constants';

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
