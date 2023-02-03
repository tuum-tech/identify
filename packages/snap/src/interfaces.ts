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
  snapPrivateKeyStore: Record<string, ManagedPrivateKey>;
  snapKeyStore: Record<string, IKey>;
  identifiers: Record<string, IIdentifier>;
  vcs: Record<string, W3CVerifiableCredential>;
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

export interface HederaAccount {
  accountId: string;
  evmAddress: string;
}

export type SnapConfirmParams = {
  prompt: string;
  description?: string;
  textAreaContent?: string;
};

export type UploadData = {
  fileName: string;
  content: string;
  accessToken: string;
};

export type GoogleToken = {
  accessToken: string;
};
