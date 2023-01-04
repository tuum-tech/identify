import { VerifiableCredential } from '@veramo/core';
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
  params: Record<'version' | string, unknown> = {}
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
        snap.id === defaultSnapOrigin && (!version || snap.version === version)
    );
  } catch (e) {
    console.log('Failed to obtain installed snap', e);
    return undefined;
  }
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
 *
 * Invoke "configureHederaAccount" method from the snap
 */
export const configureHederaAccount = async (
  privateKey: string,
  accountId: string
) => {
  return await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: [
      defaultSnapOrigin,
      {
        method: 'configureHederaAccount',
        params: {
          privateKey,
          accountId,
        },
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
 * Invoke the "getVCs" method from the snap.
 */

export const getVCs = async () => {
  return await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: [
      defaultSnapOrigin,
      {
        method: 'getVCs',
        params: { query: {} },
      },
    ],
  });
};

/**
 * Invoke the "saveVC" method from the snap.
 */

export const saveVC = async (vc: VerifiableCredential) => {
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
 * Invoke the "createExampleVC" method from the snap.
 */

export const createExampleVC = async (name: string, value: string) => {
  return await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: [
      defaultSnapOrigin,
      {
        method: 'createExampleVC',
        params: {
          exampleVCData: {
            name,
            value,
          },
        },
      },
    ],
  });
};

/**
 * Invoke the "getVP" method from the snap.
 */

export const getVP = async (vcId: string, challenge?: boolean) => {
  if (!challenge) {
    return await window.ethereum.request({
      method: 'wallet_invokeSnap',
      params: [
        defaultSnapOrigin,
        {
          method: 'getVP',
          params: { vcId: vcId },
        },
      ],
    });
  } else {
    return await window.ethereum.request({
      method: 'wallet_invokeSnap',
      params: [
        defaultSnapOrigin,
        {
          method: 'getVP',
          params: {
            vcId: vcId,
            challenge: 'ab31aeae-3471-406b-b890-6389767c4cce',
          },
        },
      ],
    });
  }
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

export const isLocalSnap = (snapId: string) => snapId.startsWith('local:');
