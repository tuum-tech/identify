import { MetaMaskInpageProvider } from '@metamask/providers';
import { SnapsGlobalObject } from '@metamask/snaps-types';
import { Panel } from '@metamask/snaps-ui';
import { IIdentifier, IKey, W3CVerifiableCredential } from '@veramo/core';
import { ManagedPrivateKey } from '@veramo/key-manager';

export type Account = {
  evmAddress: string;
  method: string;
  identifier: IIdentifier;
  privateKey: string;
  publicKey: string;
};

export type PublicAccountInfo = {
  evmAddress: string;
  did: string;
  publicKey: string;
  method: string;
  hederaAccountId?: string;
};

export type IdentitySnapState = {
  currentAccount: Account;

  /**
   * Account specific storage
   * mapping(coinType -> mapping(address -> state))
   */
  accountState: Record<string, Record<string, IdentityAccountState>>;

  /**
   * Configuration for IdentitySnap
   */
  snapConfig: IdentitySnapConfig;
};

export type IdentitySnapConfig = {
  snap: {
    acceptedTerms: boolean;
  };
  dApp: {
    disablePopups: boolean;
    friendlyDapps: string[];
  };
};

/**
 * Identity Snap State for a MetaMask address
 */
export type IdentityAccountState = {
  snapKeyStore: Record<string, IKey>;
  snapPrivateKeyStore: Record<string, ManagedPrivateKey>;
  identifiers: Record<string, IIdentifier>;
  vcs: Record<string, W3CVerifiableCredential>;

  accountConfig: IdentityAccountConfig;
  index?: number;
  extraData?: unknown;
};

export type IdentityAccountConfig = {
  identity: {
    didMethod: string;
    vcStore: string;
    googleAccessToken: string;
  };
};

export type IdentitySnapParams = {
  snap: SnapsGlobalObject;
  state: IdentitySnapState;
  metamask: MetaMaskInpageProvider;
  account: Account;
};

export type SnapDialogParams = {
  type: string;
  content: Panel;
  placeholder?: string;
};

export type UploadData = {
  fileName: string;
  content: string;
};

export type GoogleToken = {
  accessToken: string;
};

export type AccountViaPrivateKey = {
  privateKey: string;
  publicKey: string;
  address: string;
  extraData?: unknown;
};
