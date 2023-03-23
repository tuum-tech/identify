import cloneDeep from 'lodash.clonedeep';
import {
  Account,
  IdentityAccountConfig,
  IdentityAccountState,
  IdentitySnapState,
} from '../interfaces';
import { DEFAULTCOINTYPE, HEDERACOINTYPE, isIn } from '../types/constants';

const emptyAccountState = {
  snapPrivateKeyStore: {},
  snapKeyStore: {},
  identifiers: {},
  vcs: {},
  index: 0,
  accountConfig: {
    identity: {
      didMethod: 'did:pkh',
      vcStore: 'snap',
    },
  } as IdentityAccountConfig,
} as IdentityAccountState;

export const getEmptyAccountState = () => {
  return cloneDeep(emptyAccountState);
};

const initialSnapState: IdentitySnapState = {
  currentAccount: {} as Account,
  accountState: {
    [DEFAULTCOINTYPE]: {},
    [HEDERACOINTYPE]: {},
  },
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

const evmChainIDs: Record<string, string> = {
  '137': 'polygon',
};

export const validEVMChainID = (x: string) =>
  isIn(Object.keys(evmChainIDs) as string[], x);
