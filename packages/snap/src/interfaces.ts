import { MetaMaskInpageProvider } from '@metamask/providers';
import { SnapsGlobalObject } from '@metamask/snaps-types';
import { Panel } from '@metamask/snaps-ui';
import { IIdentifier, IKey, W3CVerifiableCredential } from '@veramo/core';
import { ManagedPrivateKey } from '@veramo/key-manager';

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

  index?: number;
  accountConfig: IdentityAccountConfig;
  hederaAccount: HederaAccount;
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
};

export type HederaAccount = {
  accountId: string;
  evmAddress: string;
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


export type SSISnapState = {
  /**
   * Account specific storage
   */
  accountState: Record<string, SSIAccountState>;

  /**
   * Configuration for SSISnap
   */
  snapConfig: SSISnapConfig;
};

/**
 * SSI Snap State for a MetaMask address
 */
export type SSIAccountState = {
  /**
   * Store for {@link SnapPrivateKeyStore}
   */
  snapPrivateKeyStore: Record<string, ManagedPrivateKey>;
  /**
   * Store for {@link SnapKeyStore}
   */
  snapKeyStore: Record<string, IKey>;
  /**
   * Store for {@link SnapDIDStore}
   */
  identifiers: Record<string, IIdentifier>;
  /**
   * Store for {@link SnapVCStore}
   */
  vcs: Record<string, W3CVerifiableCredential>;

  publicKey: string;
  index?: number;
  accountConfig: SSIAccountConfig;
};

export type SSISnapConfig = {
  snap: {
    acceptedTerms: boolean;
  };
  dApp: {
    disablePopups: boolean;
    friendlyDapps: string[];
  };
};

export type SSIAccountConfig = {
  ssi: {
    didMethod: AvailableMethods;
    vcStore: Record<AvailableVCStores, boolean>;
  };
};
export const availableVCStores = ['snap', 'ceramic'] as const;
export type AvailableVCStores = (typeof availableVCStores)[number];



export const availableMethods = ['did:ethr', 'did:pkh'] as const;
export type AvailableMethods = (typeof availableMethods)[number];

