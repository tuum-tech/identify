import { VerifiablePresentation, W3CVerifiableCredential } from '@veramo/core';
import {
  ExternalAccount,
  GoogleToken,
  HederaAccountParams,
  IdentitySnapState,
} from '../interfaces';
import {
  IDataManagerClearArgs,
  IDataManagerDeleteArgs,
  IDataManagerQueryArgs,
  IDataManagerSaveArgs,
} from '../plugins/veramo/verfiable-creds-manager';
import { getAccountStateByCoinType } from '../snap/state';
import {
  HEDERACOINTYPE,
  isValidProofFormat,
  isValidVCStore,
} from '../types/constants';
import { CreateVCRequestParams, CreateVPRequestParams } from '../types/params';

/**
 * Check whether the the account was imported using private key(external account).
 *
 * @param params - Request params.
 * @returns Whether to treat it as an external account that was imported using private key.
 */
export function isExternalAccountFlagSet(params: unknown): boolean {
  if (
    params !== null &&
    typeof params === 'object' &&
    'externalAccount' in params &&
    params.externalAccount !== null &&
    typeof params.externalAccount === 'object'
  ) {
    return true;
  }
  return false;
}

/**
 * Check validation of Hedera account.
 *
 * @param params - Request params.
 */
export function isValidHederaAccountParams(
  params: unknown,
): asserts params is ExternalAccount {
  if (
    params !== null &&
    typeof params === 'object' &&
    'externalAccount' in params &&
    (params as unknown as ExternalAccount).externalAccount.network ===
      'hedera' &&
    typeof (params as unknown as ExternalAccount).externalAccount.data ===
      'object' &&
    typeof (
      (params as unknown as ExternalAccount).externalAccount
        .data as HederaAccountParams
    ).accountId === 'string'
  ) {
    return;
  }

  console.error('Invalid Hedera Params passed');
  throw new Error('Invalid Hedera Params passed');
}

/**
 * Check if Hedera account was imported.
 *
 * @param state - IdentitySnapState.
 * @param accountId - Hedera identifier.
 * @param evmAddress - Ethereum address.
 * @returns Result.
 */
export async function getHederaAccountIfExists(
  state: IdentitySnapState,
  accountId: string | undefined,
  evmAddress: string | undefined,
): Promise<string> {
  let result = '';
  for (const address of Object.keys(state.accountState[HEDERACOINTYPE])) {
    const accountState = await getAccountStateByCoinType(state, address);
    const hederaAccountId = accountState.extraData;
    if (evmAddress && evmAddress === address) {
      result = hederaAccountId as string;
    }

    if (accountId && hederaAccountId === accountId) {
      result = address;
    }
  }
  return result;
}

type SwitchMethodRequestParams = {
  didMethod: string;
};

/**
 * Check Validation of Switch Method request.
 *
 * @param params - Request params.
 */
export function isValidSwitchMethodRequest(
  params: unknown,
): asserts params is SwitchMethodRequestParams {
  if (
    params !== null &&
    typeof params === 'object' &&
    'didMethod' in params &&
    (params as SwitchMethodRequestParams).didMethod !== null &&
    typeof (params as SwitchMethodRequestParams).didMethod === 'string'
  ) {
    return;
  }

  console.error('Invalid switchMethod request');
  throw new Error('Invalid switchMethod request');
}

type ResolveDIDRequestParams = { did?: string };

/**
 * Check Validation of Resolve DID request.
 *
 * @param params - Request params.
 */
export function isValidResolveDIDRequest(
  params: unknown,
): asserts params is ResolveDIDRequestParams {
  if (params !== null && typeof params === 'object') {
    return;
  }

  throw new Error('Invalid ResolveDID request');
}

/**
 * Check Validation of Get VCs request.
 *
 * @param params - Request params.
 */
export function isValidGetVCsRequest(
  params: unknown,
): asserts params is IDataManagerQueryArgs {
  if (params === null) {
    return;
  }
  const parameter = params as IDataManagerQueryArgs;

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
          if (!isValidVCStore(store)) {
            throw new Error('Store is not supported!');
          }
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
}

/**
 * Check Validation of Save VC request.
 *
 * @param params - Request params.
 */
export function isValidSaveVCRequest(
  params: unknown,
): asserts params is IDataManagerSaveArgs {
  const parameter = params as IDataManagerSaveArgs;
  if (
    parameter !== null &&
    typeof parameter === 'object' &&
    'data' in parameter &&
    parameter.data !== null
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
            if (!isValidVCStore(store)) {
              throw new Error('Store is not supported!');
            }
          });
        } else {
          throw new Error('Store is invalid format');
        }
      }
    }
    return;
  }
  throw new Error('Invalid SaveVC request');
}

/**
 * Check Validation of Create VC request.
 *
 * @param params - Request params.
 */
export function isValidCreateVCRequest(
  params: unknown,
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
            if (!isValidVCStore(store)) {
              throw new Error('Store is not supported!');
            }
          });
        } else {
          throw new Error('Store is invalid format');
        }
      }
    }
    return;
  }
  throw new Error('Invalid CreateVC request');
}

type VerifyVCRequestParams = { verifiableCredential: W3CVerifiableCredential };

/**
 * Check Validation of Verify VC request.
 *
 * @param params - Request params.
 */
export function isValidVerifyVCRequest(
  params: unknown,
): asserts params is VerifyVCRequestParams {
  if (
    params !== null &&
    typeof params === 'object' &&
    'verifiableCredential' in params
  ) {
    return;
  }

  console.error('Invalid VerifyVC request');
  throw new Error('Invalid VerifyVC request');
}

/**
 * Check Validation of Remove VC request.
 *
 * @param params - Request params.
 */
export function isValidRemoveVCRequest(
  params: unknown,
): asserts params is IDataManagerDeleteArgs {
  if (params === null) {
    return;
  }
  const parameter = params as IDataManagerDeleteArgs;

  // Check if id exists
  if ('id' in parameter && parameter.id !== null) {
    // Check if id is valid
    if (!Array.isArray(parameter.id) && !(typeof parameter.id === 'string')) {
      throw new Error('Id should either be a string or an array of strings');
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
            if (!isValidVCStore(store)) {
              throw new Error('Store is not supported!');
            }
          });
        } else {
          throw new Error('Store is invalid format');
        }
      }
    }
    return;
  }
  throw new Error('Invalid RemoveVCRequest');
}

/**
 * Check Validation of Delete all VCs request.
 *
 * @param params - Request params.
 */
export function isValidDeleteAllVCsRequest(
  params: unknown,
): asserts params is IDataManagerClearArgs {
  if (params === null) {
    return;
  }
  const parameter = params as IDataManagerClearArgs;

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
          if (!isValidVCStore(store)) {
            throw new Error('Store is not supported!');
          }
        });
      } else {
        throw new Error('Store is invalid format');
      }
    }
    return;
  }
  throw new Error('Invalid isValidDeleteAllVCsRequest');
}

/**
 * Check Validation of Create VP request.
 *
 * @param params - Request params.
 */
export function isValidCreateVPRequest(
  params: unknown,
): asserts params is CreateVPRequestParams {
  const parameter = params as CreateVPRequestParams;
  if (
    parameter !== null &&
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

/**
 * Check Validation of Verify VP request.
 *
 * @param params - Request params.
 */
export function isValidVerifyVPRequest(
  params: unknown,
): asserts params is VerifyVPRequestParams {
  if (
    params !== null &&
    typeof params === 'object' &&
    'verifiablePresentation' in params
  ) {
    return;
  }

  console.error('Invalid VerifyVP request');
  throw new Error('Invalid VerifyVP request');
}

/**
 * Check Validation of Configure google request.
 *
 * @param params - Request params.
 */
export function isValidConfigueGoogleRequest(
  params: unknown,
): asserts params is GoogleToken {
  if (
    params !== null &&
    typeof params === 'object' &&
    'accessToken' in params
  ) {
    return;
  }

  console.error('Invalid Configure Google request');
  throw new Error('Invalid Configure Google request');
}
