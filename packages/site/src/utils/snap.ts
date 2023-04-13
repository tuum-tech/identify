/* eslint-disable @typescript-eslint/ban-types */
import {
  Filter,
  IDataManagerClearArgs,
  IDataManagerDeleteArgs,
} from '@tuum-tech/identity-snap/src/plugins/veramo/verifiable-creds-manager';
import {
  CreateNewHederaAccountRequestParams,
  CreateVPRequestParams,
} from '@tuum-tech/identity-snap/src/types/params';

import { VerifiableCredential, VerifiablePresentation } from '@veramo/core';
import { defaultSnapId } from '../config/snap';
import { ExternalAccountParams, GetSnapsResponse, Snap } from '../types';
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
export const connectSnap = async (snapId: string = defaultSnapId) => {
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
        snap.id === defaultSnapId && (!version || snap.version === version),
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
 * Invoke the "hello" method from the snap.
 */

export const sendHello = async () => {
  return await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: {
      snapId: defaultSnapId,
      request: { method: 'hello', params: {} },
    },
  });
};

/**
 * Invoke the "togglePopups" method from the snap.
 */

export const togglePopups = async () => {
  return await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: {
      snapId: defaultSnapId,
      request: { method: 'togglePopups', params: {} },
    },
  });
};

/**
 * Invoke the "getAccountInfo" method from the snap.
 */

export const getAccountInfo = async (
  params: ExternalAccountParams | undefined,
) => {
  return await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: {
      snapId: defaultSnapId,
      request: { method: 'getAccountInfo', params: params || {} },
    },
  });
};

/**
 * Invoke "createNewHederaAccount" method from the snap
 */

export const createNewHederaAccount = async (
  {
    hbarAmountToSend,
    newAccountPublickey = '',
    newAccountEvmAddress = '',
  }: CreateNewHederaAccountRequestParams,
  externalAccountparams?: ExternalAccountParams,
) => {
  if (newAccountPublickey) {
    return await window.ethereum.request({
      method: 'wallet_invokeSnap',
      params: {
        snapId: defaultSnapId,
        request: {
          method: 'createNewHederaAccount',
          params: {
            hbarAmountToSend,
            newAccountPublickey,
            ...externalAccountparams,
          },
        },
      },
    });
  }
  return await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: {
      snapId: defaultSnapId,
      request: {
        method: 'createNewHederaAccount',
        params: {
          hbarAmountToSend,
          newAccountEvmAddress,
          ...externalAccountparams,
        },
      },
    },
  });
};

/**
 * Invoke the "resolveDID" method from the snap.
 */

export const resolveDID = async (
  did?: string,
  externalAccountparams?: ExternalAccountParams,
) => {
  return await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: {
      snapId: defaultSnapId,
      request: {
        method: 'resolveDID',
        params: { did, ...externalAccountparams },
      },
    },
  });
};

/**
 * Invoke the "getVCs" method from the snap.
 */

export const getVCs = async (
  filter: Filter | undefined,
  options: any,
  externalAccountparams?: ExternalAccountParams,
) => {
  return await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: {
      snapId: defaultSnapId,
      request: {
        method: 'getVCs',
        params: { filter, options, ...externalAccountparams },
      },
    },
  });
};

/**
 * Invoke the "saveVC" method from the snap.
 */

export const saveVC = async (params: any) => {
  return await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: {
      snapId: defaultSnapId,
      request: {
        method: 'saveVC',
        params,
      },
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
  options: any,
  credTypes?: string[],
  externalAccountparams?: ExternalAccountParams,
) => {
  return await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: {
      snapId: defaultSnapId,
      request: {
        method: 'createVC',
        params: {
          vcKey,
          vcValue,
          options,
          credTypes,
          ...externalAccountparams,
        },
      },
    },
  });
};

/**
 * Invoke the "verifyVC" method from the snap.
 */

export const verifyVC = async (vc: VerifiableCredential | {}) => {
  return await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: {
      snapId: defaultSnapId,
      request: {
        method: 'verifyVC',
        params: { verifiableCredential: vc },
      },
    },
  });
};

/**
 * Invoke the "removeVC" method from the snap.
 */

export const removeVC = async (
  id: string | string[],
  options: IDataManagerDeleteArgs,
  externalAccountparams?: ExternalAccountParams,
) => {
  return await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: {
      snapId: defaultSnapId,
      request: {
        method: 'removeVC',
        params: { id, options, ...externalAccountparams },
      },
    },
  });
};

/**
 * Invoke the "deleteAllVCs" method from the snap.
 */

export const deleteAllVCs = async (
  options: IDataManagerClearArgs,
  externalAccountparams?: ExternalAccountParams,
) => {
  return await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: {
      snapId: defaultSnapId,
      request: {
        method: 'deleteAllVCs',
        params: { options, ...externalAccountparams },
      },
    },
  });
};

/**
 * Invoke the "createVP" method from the snap.
 */

export const createVP = async (
  { vcIds, vcs, proofInfo }: CreateVPRequestParams,
  externalAccountparams?: ExternalAccountParams,
) => {
  return await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: {
      snapId: defaultSnapId,
      request: {
        method: 'createVP',
        params: { vcIds, vcs, proofInfo, ...externalAccountparams },
      },
    },
  });
};

/**
 * Invoke the "verifyVP" method from the snap.
 */

export const verifyVP = async (vp: VerifiablePresentation | {}) => {
  return await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: {
      snapId: defaultSnapId,
      request: {
        method: 'verifyVP',
        params: { verifiablePresentation: vp },
      },
    },
  });
};

/**
 * Invoke the "getCurrentDIDMethod" method from the snap.
 */

export const getCurrentDIDMethod = async () => {
  return await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: {
      snapId: defaultSnapId,
      request: {
        method: 'getCurrentDIDMethod',
        params: {},
      },
    },
  });
};

/**
 * Invoke the "configureGoogleAccount" method from the snap.
 */

export const configureGoogleAccount = async (accessToken: string) => {
  return await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: {
      snapId: defaultSnapId,
      request: {
        method: 'configureGoogleAccount',
        params: { accessToken },
      },
    },
  });
};

/**
 * Invoke the "syncGoogleVCs" method from the snap.
 */

export const syncGoogleVCs = async () => {
  return await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: {
      snapId: defaultSnapId,
      request: {
        method: 'syncGoogleVCs',
        params: {},
      },
    },
  });
};

export const isLocalSnap = (snapId: string) => snapId.startsWith('local:');
