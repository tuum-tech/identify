import { isIn } from '../types/constants';

const hederaChainIDs: Record<string, string> = {
  '0x127': 'mainnet',
  '0x128': 'testnet',
  '0x129': 'previewnet',
};

const evmChainIDs: Record<string, string> = {
  '137': 'polygon',
};

export const getHederaNetwork = (chainId: string): string => {
  const network = hederaChainIDs[chainId];
  return network || 'mainnet';
};

export const validHederaChainID = (x: string) => {
  return isIn(Object.keys(hederaChainIDs) as string[], x);
};

export const validEVMChainID = (x: string) =>
  isIn(Object.keys(evmChainIDs) as string[], x);
