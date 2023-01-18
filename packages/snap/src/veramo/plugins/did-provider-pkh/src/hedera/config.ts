import cloneDeep from 'lodash.clonedeep';

const hederaChainIDs = new Map([
  ['0x127', 'mainnet'],
  ['0x128', 'testnet'],
  ['0x129', 'previewnet'],
  ['0x12a', 'localnet'],
]);

export const getHederaChainIDs = () => {
  return cloneDeep(hederaChainIDs);
};
