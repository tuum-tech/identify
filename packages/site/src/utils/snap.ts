/* eslint-disable @typescript-eslint/ban-types */
import {
  CreateVPRequestParams,
  GetVCsOptions,
  RemoveVCOptions,
} from '@tuum-tech/identity-snap/src/types/params';
import { Filter } from '@tuum-tech/identity-snap/src/veramo/plugins/verfiable-creds-manager';
import { VerifiableCredential, VerifiablePresentation } from '@veramo/core';
import { defaultSnapOrigin } from '../config';
import { GetSnapsResponse, Snap } from '../types';

/**
 * Get the installed snaps in MetaMask.
 *
 * @returns The snaps installed in MetaMask.
 */
export const getSnaps = async (): Promise<GetSnapsResponse> => {
  return (await window.ethereum.request({
    method: 'wallet_getSnaps',
  })) as unknown as GetSnapsResponse;
};

/**
 * Connect a snap to MetaMask.
 *
 * @param snapId - The ID of the snap, params - The params to pass with the snap to connect.
 */
export const connectSnap = async (snapId: string = defaultSnapOrigin) => {
  await window.ethereum.request({
    method: 'wallet_requestSnaps',
    params: {
      [snapId]: { version: 'latest' },
    },
  });
};

/**
 * Get the snap from MetaMask.
 *
 * @param version - The version of the snap to install (optional).
 * @returns The snap object returned by the extension.
 */
export const getSnap = async (version?: string): Promise<Snap | undefined> => {
  try {
    const snaps = await getSnaps();

    return Object.values(snaps).find(
      (snap) =>
        snap.id === defaultSnapOrigin && (!version || snap.version === version),
    );
  } catch (e) {
    console.log('Failed to obtain installed snap', e);
    return undefined;
  }
};

export const getCurrentNetwork = async (): Promise<string> => {
  return (await window.ethereum.request({
    method: 'eth_chainId',
  })) as string;
};

/**
 * Invoke "connectHederaAccount" method from the snap
 */

export const connectHederaAccount = async (accountId: string) => {
  return await window.ethereum.request({
    method: `wallet_snap_${defaultSnapOrigin}`,
    params: {
      method: 'connectHederaAccount',
      params: {
        accountId,
      },
    },
  });
};

/**
 * Invoke "createNewHederaAccount" method from the snap
 */

export const createNewHederaAccount = async (
  newAccountPublickey: string,
  hbarAmountToSend: number,
) => {
  return await window.ethereum.request({
    method: `wallet_snap_${defaultSnapOrigin}`,
    params: {
      method: 'createNewHederaAccount',
      params: {
        newAccountPublickey,
        hbarAmountToSend,
      },
    },
  });
};

/**
 * Invoke the "hello" method from the snap.
 */

export const sendHello = async () => {
  await window.ethereum.request({
    method: `wallet_snap_${defaultSnapOrigin}`,
    params: {
      method: 'hello',
      params: {},
    },
  });
};

/**
 * Invoke the "togglePopups" method from the snap.
 */

export const togglePopups = async () => {
  await window.ethereum.request({
    method: `wallet_snap_${defaultSnapOrigin}`,
    params: {
      method: 'togglePopups',
      params: {},
    },
  });
};

/**
 * Invoke the "getCurrentDIDMethod" method from the snap.
 */

export const getCurrentDIDMethod = async () => {
  return await window.ethereum.request({
    method: `wallet_snap_${defaultSnapOrigin}`,
    params: {
      method: 'getCurrentDIDMethod',
      params: {},
    },
  });
};

export type PublicAccountInfo = {
  evmAddress: string;
  did: string;
  publicKey: string;
  method: string;
  hederaAccountId?: string;
};

/**
 * Invoke the "getAccountInfo" method from the snap.
 */

export const getAccountInfo = async () => {
  return await window.ethereum.request({
    method: `wallet_snap_${defaultSnapOrigin}`,
    params: {
      method: 'getAccountInfo',
      params: {},
    },
  });
};

/**
 * Invoke the "getDID" method from the snap.
 */

export const getDID = async () => {
  return await window.ethereum.request({
    method: `wallet_snap_${defaultSnapOrigin}`,
    params: {
      method: 'getDID',
      params: {
        externalAccount: true,
        accountId: '0.0.3831609',
      },
    },
  });
};

/**
 * Invoke the "resolveDID" method from the snap.
 */

export const resolveDID = async (did?: string) => {
  return await window.ethereum.request({
    method: `wallet_snap_${defaultSnapOrigin}`,
    params: {
      method: 'resolveDID',
      params: { did },
    },
  });
};

/**
 * Invoke the "getVCs" method from the snap.
 */

export const getVCs = async (
  filter: Filter | undefined,
  options: GetVCsOptions,
) => {
  return await window.ethereum.request({
    method: `wallet_snap_${defaultSnapOrigin}`,
    params: {
      method: 'getVCs',
      params: { filter, options },
    },
  });
};

/**
 * Invoke the "saveVC" method from the snap.
 */

export const saveVC = async (vc: VerifiableCredential | {}) => {
  return await window.ethereum.request({
    method: `wallet_snap_${defaultSnapOrigin}`,
    params: {
      method: 'saveVC',
      params: { verifiableCredential: vc },
    },
  });
};

export type ExampleVCValue = {
  name: string;
  value: string;
};

/**
 * Invoke the "createVC" method from the snap.
 */

export const createVC = async (
  vcKey: string,
  vcValue: object,
  options: GetVCsOptions,
  credTypes?: string[],
) => {
  return await window.ethereum.request({
    method: `wallet_snap_${defaultSnapOrigin}`,
    params: {
      method: 'createVC',
      params: {
        vcKey,
        vcValue,
        options,
        credTypes,
      },
    },
  });
};

/**
 * Invoke the "configureGoogleAccount" method from the snap.
 */

export const configureGoogleAccount = async (accessToken: string) => {
  return await window.ethereum.request({
    method: `wallet_snap_${defaultSnapOrigin}`,
    params: {
      method: 'configureGoogleAccount',
      params: {
        accessToken,
      },
    },
  });
};

/**
 * Invoke the "syncGoogleVCs" method from the snap.
 */

export const syncGoogleVCs = async () => {
  return await window.ethereum.request({
    method: `wallet_snap_${defaultSnapOrigin}`,
    params: {
      method: 'syncGoogleVCs',
      params: {},
    },
  });
};

/**
 * Invoke the "verifyVC" method from the snap.
 */

export const verifyVC = async (vc: VerifiableCredential | {}) => {
  return await window.ethereum.request({
    method: `wallet_snap_${defaultSnapOrigin}`,
    params: {
      method: 'verifyVC',
      params: { verifiableCredential: vc },
    },
  });
};

/**
 * Invoke the "removeVC" method from the snap.
 */

export const removeVC = async (
  id: string | string[],
  options: RemoveVCOptions,
) => {
  return await window.ethereum.request({
    method: `wallet_snap_${defaultSnapOrigin}`,
    params: {
      method: 'removeVC',
      params: { id, options },
    },
  });
};

/**
 * Invoke the "deleteAllVCs" method from the snap.
 */

export const deleteAllVCs = async (options: RemoveVCOptions) => {
  return await window.ethereum.request({
    method: `wallet_snap_${defaultSnapOrigin}`,
    params: {
      method: 'deleteAllVCs',
      params: { options },
    },
  });
};

/**
 * Invoke the "createVP" method from the snap.
 */

export const createVP = async ({
  vcIds,
  vcs,
  proofInfo,
}: CreateVPRequestParams) => {
  return await window.ethereum.request({
    method: `wallet_snap_${defaultSnapOrigin}`,
    params: {
      method: 'createVP',
      params: { vcIds, vcs, proofInfo },
    },
  });
};

/**
 * Invoke the "verifyVP" method from the snap.
 */

export const verifyVP = async (vp: VerifiablePresentation | {}) => {
  return await window.ethereum.request({
    method: `wallet_snap_${defaultSnapOrigin}`,
    params: {
      method: 'verifyVP',
      params: { verifiablePresentation: vp },
    },
  });
};

export const isLocalSnap = (snapId: string) => snapId.startsWith('local:');
