import { IIdentifier, IKey, VerifiableCredential } from '@veramo/core';
import { ManagedPrivateKey } from '@veramo/key-manager';
import { availableVCStores } from './veramo/plugins/availableVCStores';

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

  /**
   * Configuration for Hedera Account
   */
  hederaAccount: HederaAccount;
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
  vcs: Record<string, VerifiableCredential>;
  accountConfig: IdentityAccountConfig;
}

export interface IdentityAccountConfig {
  identity: {
    didMethod: string;
    vcStore: typeof availableVCStores[number];
  };
}

export interface HederaAccount {
  privateKey: string;
  publicKey: string;
  accountId: string;
  evmAddress: string;
}

export type SnapConfirmParams = {
  prompt: string;
  description?: string;
  textAreaContent?: string;
};

export interface VCQuery {
  [key: string]: string;
}

export type ExampleVCValue = {
  name: string;
  value: string;
};
