import { MetaMaskInpageProvider } from '@metamask/providers';
import { SnapsGlobalObject } from '@metamask/snaps-types';
import { Panel } from '@metamask/snaps-ui';
import { IIdentifier, IKey, W3CVerifiableCredential } from '@veramo/core';
import { ManagedPrivateKey } from '@veramo/key-manager';

/* eslint-disable */
export type IdentitySnapState = {
  currentAccount: string;

  /**
   * Account specific storage
   */
  accountState: Record<string, IdentityAccountState>;

  /**
   * Configuration for IdentitySnap
   */
  snapConfig: IdentitySnapConfig;
};

export interface IdentitySnapConfig {
  snap: {
    acceptedTerms: boolean;
  };
  dApp: {
    disablePopups: boolean;
    friendlyDapps: Array<string>;
  };
}

/**
 * Identity Snap State for a MetaMask address
 */
export interface IdentityAccountState {
  snapKeyStore: Record<string, IKey>;
  snapPrivateKeyStore: Record<string, ManagedPrivateKey>;
  identifiers: Record<string, IIdentifier>;
  vcs: Record<string, W3CVerifiableCredential>;

  index?: number;
  accountConfig: IdentityAccountConfig;
  hederaAccount: HederaAccount;
}

export interface IdentityAccountConfig {
  identity: {
    didMethod: string;
    vcStore: string;
    googleAccessToken: string;
  };
}

export interface IdentitySnapParams {
  snap: SnapsGlobalObject;
  state: IdentitySnapState;
  metamask: MetaMaskInpageProvider;
}

export interface HederaAccount {
  accountId: string;
  evmAddress: string;
}

export type SnapDialogParams = {
  type: string;
  content: Panel;
  promptPlaceholder?: string;
};

export type UploadData = {
  fileName: string;
  content: string;
};

export type GoogleToken = {
  accessToken: string;
};
