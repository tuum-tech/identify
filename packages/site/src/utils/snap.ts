import {
  GetVCsOptions,
  ProofInfo,
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
 * @param snapId - The ID of the snap.
 * @param params - The params to pass with the snap to connect.
 */
export const connectSnap = async (
  snapId: string = defaultSnapOrigin,
  params: Record<'version' | string, unknown> = {},
) => {
  await window.ethereum.request({
    method: 'wallet_enable',
    params: [
      {
        wallet_snap: {
          [snapId]: {
            ...params,
          },
        },
      },
    ],
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

export const connectHederaAccount = async (
  privateKey: string,
  accountId: string,
) => {
  return await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: [
      defaultSnapOrigin,
      {
        method: 'connectHederaAccount',
        params: {
          privateKey,
          accountId,
        },
      },
    ],
  });
};

/**
 * Invoke the "hello" method from the snap.
 */

export const sendHello = async () => {
  await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: [
      defaultSnapOrigin,
      {
        method: 'hello',
      },
    ],
  });
};

/**
 * Invoke the "getCurrentDIDMethod" method from the snap.
 */

export const getCurrentDIDMethod = async () => {
  return await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: [
      defaultSnapOrigin,
      {
        method: 'getCurrentDIDMethod',
      },
    ],
  });
};

/**
 * Invoke the "getDID" method from the snap.
 */

export const getDID = async () => {
  return await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: [
      defaultSnapOrigin,
      {
        method: 'getDID',
      },
    ],
  });
};

/**
 * Invoke the "resolveDID" method from the snap.
 */

export const resolveDID = async (did?: string) => {
  return await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: [
      defaultSnapOrigin,
      {
        method: 'resolveDID',
        params: { did },
      },
    ],
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
    method: 'wallet_invokeSnap',
    params: [
      defaultSnapOrigin,
      {
        method: 'getVCs',
        params: { filter, options },
      },
    ],
  });
};

/**
 * Invoke the "saveVC" method from the snap.
 */

export const saveVC = async (vc: VerifiableCredential | {}) => {
  return await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: [
      defaultSnapOrigin,
      {
        method: 'saveVC',
        params: { verifiableCredential: vc },
      },
    ],
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
    method: 'wallet_invokeSnap',
    params: [
      defaultSnapOrigin,
      {
        method: 'createVC',
        params: {
          vcKey,
          vcValue,
          options,
          credTypes,
        },
      },
    ],
  });
};

/**
 * Invoke the "configureGoogleAccount" method from the snap.
 */

export const configureGoogleAccount = async (accessToken: string) => {
  return await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: [
      defaultSnapOrigin,
      {
        method: 'configureGoogleAccount',
        params: {
          accessToken,
        },
      },
    ],
  });
};

/**
 * Invoke the "uploadToGoogleDrive" method from the snap.
 */

export const uploadToGoogleDrive = async (
  fileName: string,
  content: string,
) => {
  return await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: [
      defaultSnapOrigin,
      {
        method: 'uploadToGoogleDrive',
        params: {
          uploadData: {
            fileName,
            content,
          },
        },
      },
    ],
  });
};

/**
 * Invoke the "verifyVC" method from the snap.
 */

export const verifyVC = async (vc: VerifiableCredential | {}) => {
  return await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: [
      defaultSnapOrigin,
      {
        method: 'verifyVC',
        params: { verifiableCredential: vc },
      },
    ],
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
    method: 'wallet_invokeSnap',
    params: [
      defaultSnapOrigin,
      {
        method: 'removeVC',
        params: { id, options },
      },
    ],
  });
};

/**
 * Invoke the "deleteAllVCs" method from the snap.
 */

export const deleteAllVCs = async (options: RemoveVCOptions) => {
  return await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: [
      defaultSnapOrigin,
      {
        method: 'deleteAllVCs',
        params: { options },
      },
    ],
  });
};

/**
 * Invoke the "createVP" method from the snap.
 */

export const createVP = async (vcs: string[], proofInfo: ProofInfo) => {
  return await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: [
      defaultSnapOrigin,
      {
        method: 'createVP',
        params: { vcs, proofInfo },
      },
    ],
  });
};

/**
 * Invoke the "verifyVP" method from the snap.
 */

export const verifyVP = async (vp: VerifiablePresentation | {}) => {
  return await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: [
      defaultSnapOrigin,
      {
        method: 'verifyVP',
        params: { verifiablePresentation: vp },
      },
    ],
  });
};

export const isLocalSnap = (snapId: string) => snapId.startsWith('local:');
