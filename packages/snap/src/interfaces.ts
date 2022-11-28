import { IIdentifier, IKey, VerifiableCredential } from '@veramo/core';
import { ManagedPrivateKey } from '@veramo/key-manager';
import { availableMethods } from './did/didMethods';

/* eslint-disable */
export type IdentitySnapState = {
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
  vcs: Record<string, VerifiableCredential>;
  publicKey: string;
  privateKey: string;
  accountConfig: IdentityAccountConfig;
}

export interface IdentityAccountConfig {
  identity: {
    didMethod: typeof availableMethods[number];
    vcStore: string;
  };
}

export type SnapConfirmParams = {
  prompt: string;
  description?: string;
  textAreaContent?: string;
};
