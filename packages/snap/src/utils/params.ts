import { VerifiablePresentation, W3CVerifiableCredential } from '@veramo/core';
import { IdentitySnapState } from '../interfaces';
import { isValidProofFormat, isValidVCStore } from '../types/constants';
import {
  CreateVCRequestParams,
  CreateVPRequestParams,
  GetVCsRequestParams,
  SaveVCRequestParams,
} from '../types/params';

/* eslint-disable */
type HederaAccountParams = {
  privateKey: string;
  accountId: string;
};

export function isValidHederaAccountParams(
  params: unknown
): asserts params is HederaAccountParams {
  if (
    params !== null &&
    typeof params === 'object' &&
    'privateKey' in params &&
    (params as HederaAccountParams).privateKey != null &&
    typeof (params as HederaAccountParams).privateKey === 'string' &&
    'accountId' in params &&
    (params as HederaAccountParams).accountId != null &&
    typeof (params as HederaAccountParams).accountId === 'string'
  )
    return;

  console.error('Invalid Hedera Params passed');
  throw new Error('Invalid Hedera Params passed');
}

export function isHederaAccountImported(state: IdentitySnapState): boolean {
  if (
    state.hederaAccount.privateKey !== '' &&
    state.hederaAccount.publicKey !== '' &&
    state.hederaAccount.accountId !== ''
  ) {
    return true;
  } else {
    return false;
  }
}

type SwitchMethodRequestParams = {
  didMethod: string;
};

export function isValidSwitchMethodRequest(
  params: unknown
): asserts params is SwitchMethodRequestParams {
  if (
    params != null &&
    typeof params === 'object' &&
    'didMethod' in params &&
    (params as SwitchMethodRequestParams).didMethod != null &&
    typeof (params as SwitchMethodRequestParams).didMethod === 'string'
  )
    return;

  console.error('Invalid switchMethod request');
  throw new Error('Invalid switchMethod request');
}

type ResolveDIDRequestParams = { did?: string };

export function isValidResolveDIDRequest(
  params: unknown
): asserts params is ResolveDIDRequestParams {
  if (params != null && typeof params === 'object') return;

  throw new Error('Invalid ResolveDID request');
}

export function isValidGetVCsRequest(
  params: unknown
): asserts params is GetVCsRequestParams {
  if (params === null) return;
  const parameter = params as GetVCsRequestParams;

  // Check if filter is valid
  if (
    'filter' in parameter &&
    parameter.filter !== null &&
    typeof parameter.filter === 'object'
  ) {
    if (
      !(
        'type' in parameter.filter &&
        parameter.filter?.type !== null &&
        typeof parameter.filter?.type === 'string'
      )
    ) {
      throw new Error('Filter type is missing or not a string!');
    }
    if (!('filter' in parameter.filter && parameter.filter?.filter !== null)) {
      throw new Error('Filter is missing!');
    }
  }

  // Check if options is valid
  if (
    'options' in parameter &&
    parameter.options !== null &&
    typeof parameter.options === 'object'
  ) {
    if ('store' in parameter.options && parameter.options?.store !== null) {
      if (typeof parameter.options?.store === 'string') {
        if (!isValidVCStore(parameter.options?.store)) {
          throw new Error('Store is not supported!');
        }
      } else if (
        Array.isArray(parameter.options?.store) &&
        parameter.options?.store.length > 0
      ) {
        (parameter.options?.store as [string]).forEach((store) => {
          if (!isValidVCStore(store))
            throw new Error('Store is not supported!');
        });
      } else {
        throw new Error('Store is invalid format');
      }
    }
    if ('returnStore' in parameter.options) {
      if (
        !(
          'returnStore' in parameter.options &&
          parameter.options?.returnStore !== null &&
          typeof parameter.options?.returnStore === 'boolean'
        )
      ) {
        throw new Error('ReturnStore is invalid format');
      }
    }
  }
  return;
}

export function isValidSaveVCRequest(
  params: unknown
): asserts params is SaveVCRequestParams {
  const parameter = params as SaveVCRequestParams;
  if (
    parameter !== null &&
    typeof parameter === 'object' &&
    'verifiableCredential' in parameter &&
    parameter.verifiableCredential !== null
  ) {
    if (
      'options' in parameter &&
      parameter.options !== null &&
      typeof parameter.options === 'object'
    ) {
      if ('store' in parameter.options && parameter.options?.store !== null) {
        if (typeof parameter.options?.store === 'string') {
          if (!isValidVCStore(parameter.options?.store)) {
            throw new Error('Store is not supported!');
          }
        } else if (
          Array.isArray(parameter.options?.store) &&
          parameter.options?.store.length > 0
        ) {
          (parameter.options?.store as [string]).forEach((store) => {
            if (!isValidVCStore(store))
              throw new Error('Store is not supported!');
          });
        } else throw new Error('Store is invalid format');
      }
    }
    return;
  }
  throw new Error('Invalid SaveVC request');
}

export function isValidCreateVCRequest(
  params: unknown
): asserts params is CreateVCRequestParams {
  const parameter = params as CreateVCRequestParams;
  if (
    parameter !== null &&
    typeof parameter === 'object' &&
    'vcValue' in parameter &&
    parameter.vcValue !== null &&
    typeof parameter.vcValue === 'object'
  ) {
    if (
      'options' in parameter &&
      parameter.options !== null &&
      typeof parameter.options === 'object'
    ) {
      if ('store' in parameter.options && parameter.options?.store !== null) {
        if (typeof parameter.options?.store === 'string') {
          if (!isValidVCStore(parameter.options?.store)) {
            throw new Error('Store is not supported!');
          }
        } else if (
          Array.isArray(parameter.options?.store) &&
          parameter.options?.store.length > 0
        ) {
          (parameter.options?.store as [string]).forEach((store) => {
            if (!isValidVCStore(store))
              throw new Error('Store is not supported!');
          });
        } else throw new Error('Store is invalid format');
      }
    }
    return;
  }
  throw new Error('Invalid CreateVC request');
}

type VerifyVCRequestParams = { verifiableCredential: W3CVerifiableCredential };

export function isValidVerifyVCRequest(
  params: unknown
): asserts params is VerifyVCRequestParams {
  if (
    params !== null &&
    typeof params === 'object' &&
    'verifiableCredential' in params
  )
    return;

  console.error('Invalid VerifyVC request');
  throw new Error('Invalid VerifyVC request');
}

export function isValidCreateVPRequest(
  params: unknown
): asserts params is CreateVPRequestParams {
  const parameter = params as CreateVPRequestParams;
  if (
    parameter != null &&
    typeof parameter === 'object' &&
    'vcs' in parameter &&
    parameter.vcs !== null &&
    Array.isArray(parameter.vcs) &&
    parameter.vcs.length > 0
  ) {
    // Check if proofInfo is valid
    if (
      'proofInfo' in parameter &&
      typeof parameter.proofInfo === 'object' &&
      parameter.proofInfo !== null
    ) {
      // Check if proofFormat is valid
      if (
        'proofFormat' in parameter.proofInfo &&
        parameter.proofInfo.proofFormat !== null &&
        !isValidProofFormat(parameter.proofInfo.proofFormat as string)
      ) {
        throw new Error('Proof format not supported');
      }
      // Check if type is a string
      if (
        'type' in parameter.proofInfo &&
        parameter.proofInfo.type !== null &&
        typeof parameter.proofInfo.type !== 'string'
      ) {
        throw new Error('Type is not a string');
      }
      // Check if domain is a string
      if (
        'domain' in parameter.proofInfo &&
        parameter.proofInfo.domain !== null &&
        typeof parameter.proofInfo.domain !== 'string'
      ) {
        throw new Error('Domain is not a string');
      }
      // Check if challenge is a string
      if (
        'challenge' in parameter.proofInfo &&
        parameter.proofInfo.challenge !== null &&
        typeof parameter.proofInfo.challenge !== 'string'
      ) {
        throw new Error('Challenge is not a string');
      }
    }
    return;
  }

  throw new Error('Invalid CreateVP request');
}

type VerifyVPRequestParams = { verifiablePresentation: VerifiablePresentation };

export function isValidVerifyVPRequest(
  params: unknown
): asserts params is VerifyVPRequestParams {
  if (
    params !== null &&
    typeof params === 'object' &&
    'verifiablePresentation' in params
  )
    return;

  console.error('Invalid VerifyVP request');
  throw new Error('Invalid VerifyVP request');
}
