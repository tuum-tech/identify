import cloneDeep from 'lodash.clonedeep';
import {
  HederaAccount,
  IdentityAccountConfig,
  IdentityAccountState,
  IdentitySnapState,
} from '../interfaces';

const hederaChainIDs = new Map([
  ['0x127', 'mainnet'],
  ['0x128', 'testnet'],
  ['0x129', 'previewnet'],
  ['0x12a', 'localnet'],
]);

export const getHederaChainIDs = () => {
  return cloneDeep(hederaChainIDs);
};

const emptyAccountState = {
  snapPrivateKeyStore: {},
  snapKeyStore: {},
  identifiers: {},
  vcs: {},
  accountConfig: {
    identity: {
      didMethod: 'did:pkh',
      vcStore: 'snap',
    },
  } as IdentityAccountConfig,
  hederaAccount: {} as HederaAccount,
} as IdentityAccountState;

export const getEmptyAccountState = () => {
  return cloneDeep(emptyAccountState);
};

const initialSnapState: IdentitySnapState = {
  currentAccount: '',
  accountState: {},
  snapConfig: {
    dApp: {
      disablePopups: false,
      friendlyDapps: [],
    },
    snap: {
      acceptedTerms: true,
    },
  },
};

export const getInitialSnapState = () => {
  return cloneDeep(initialSnapState);
};
