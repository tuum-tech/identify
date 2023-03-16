import { VerifiablePresentation, W3CVerifiableCredential } from '@veramo/core';
import _ from 'lodash';
import { GoogleToken, IdentitySnapState } from '../interfaces';
import {
  IDataManagerClearArgs,
  IDataManagerDeleteArgs,
  IDataManagerQueryArgs,
  IDataManagerSaveArgs,
} from '../plugins/veramo/verfiable-creds-manager';
import { getAccountStateByCoinType } from '../snap/state';
import {
  availableProofFormats,
  availableVCStores,
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
    typeof params.externalAccount === 'boolean'
  ) {
    return params.externalAccount;
  }
  return false;
}

type HederaAccountParams = {
  accountId: string;
};

/**
 * Check validation of Hedera account.
 *
 * @param params - Request params.
 */
export function isValidHederaAccountParams(
  params: unknown,
): asserts params is HederaAccountParams {
  if (params === null || _.isEmpty(params)) {
    console.error(
      'Invalid Hedera Params passed. "accountId" must be passed as a parameter',
    );
    throw new Error(
      'Invalid Hedera Params passed. "accountId" must be passed as a parameter',
    );
  }
  const parameter = params as HederaAccountParams;

  if (
    'accountId' in parameter &&
    parameter.accountId !== null &&
    typeof parameter.accountId === 'string'
  ) {
    return;
  }

  console.error(
    'Invalid Hedera Params passed. "accountId" must be passed as a parameter and it must be a string',
  );
  throw new Error(
    'Invalid Hedera Params passed. "accountId" must be passed as a parameter and it must be a string',
  );
}

type CreateNewHederaAccountParams = {
  newAccountPublickey: string;
  hbarAmountToSend: number;
};

/**
 * Check validation of when trying to create a new Hedera account.
 *
 * @param params - Request params.
 */
export function isValidCreateNewHederaAccountParams(
  params: unknown,
): asserts params is CreateNewHederaAccountParams {
  if (params === null || _.isEmpty(params)) {
    console.error(
      'Invalid createNewHederaAccount Params passed. "newAccountPublickey" and "hbarAmountToSend" must be passed as parameters',
    );
    throw new Error(
      'Invalid createNewHederaAccount Params passed. "newAccountPublickey" and "hbarAmountToSend" must be passed as parameters',
    );
  }
  const parameter = params as CreateNewHederaAccountParams;

  // Check if newAccountPublickey is valid
  if (
    !(
      'newAccountPublickey' in parameter &&
      parameter.newAccountPublickey !== null &&
      typeof parameter.newAccountPublickey === 'string'
    )
  ) {
    console.error(
      'Invalid createNewHederaAccount Params passed. "newAccountPublickey" is either missing or is not a string',
    );
    throw new Error(
      'Invalid createNewHederaAccount Params passed. "newAccountPublickey" is either missing or is not a string',
    );
  }

  // Check if hbarAmountToSend is valid
  if (
    !(
      'hbarAmountToSend' in parameter &&
      parameter.hbarAmountToSend !== null &&
      typeof parameter.hbarAmountToSend === 'number'
    )
  ) {
    console.error(
      'Invalid createNewHederaAccount Params passed. "hbarAmountToSend" is either missing or is not a number',
    );
    throw new Error(
      'Invalid createNewHederaAccount Params passed. "hbarAmountToSend" is either missing or is not a number',
    );
  }
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
  if (params === null || _.isEmpty(params)) {
    console.error(
      'Invalid switchMethod Params passed. "didMethod" must be passed as a parameter',
    );
    throw new Error(
      'Invalid switchMethod Params passed. "didMethod" must be passed as a parameter',
    );
  }
  const parameter = params as SwitchMethodRequestParams;

  if (
    'didMethod' in parameter &&
    parameter.didMethod !== null &&
    typeof parameter.didMethod === 'string'
  ) {
    return;
  }

  console.error(
    'Invalid switchMethod Params passed. "didMethod" must be passed as a parameter and it must be a string',
  );
  throw new Error(
    'Invalid switchMethod Params passed. "didMethod" must be passed as a parameter and it must be a string',
  );
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
  if (params === null || _.isEmpty(params)) {
    return;
  }

  const parameter = params as ResolveDIDRequestParams;

  if (
    'did' in parameter &&
    parameter.did !== null &&
    typeof parameter.did === 'string'
  ) {
    return;
  }

  console.error(
    'Invalid resolveDID Params passed. "did" must be passed as a parameter and it must be a string',
  );
  throw new Error(
    'Invalid resolveDID Params passed. "did" must be passed as a parameter and it must be a string',
  );
}

/**
 * Check Validation of Get VCs request.
 *
 * @param params - Request params.
 */
export function isValidGetVCsRequest(
  params: unknown,
): asserts params is IDataManagerQueryArgs {
  if (params === null || _.isEmpty(params)) {
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
      console.error(
        'Invalid getVCs Params passed. "filter.type" is either missing or is not a string',
      );
      throw new Error(
        'Invalid getVCs Params passed. "filter.type" is either missing or is not a string',
      );
    }

    if (!('filter' in parameter.filter && parameter.filter?.filter !== null)) {
      console.error('Invalid getVCs Params passed. "filter.filter" is missing');
      throw new Error(
        'Invalid getVCs Params passed. "filter.filter" is missing',
      );
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
          console.error(
            `Invalid getVCs Params passed. "options.store" is not a valid store. The valid store is one of the following: ${availableVCStores}`,
          );
          throw new Error(
            `Invalid getVCs Params passed. "options.store" is not a valid store. The valid store is one of the following: ${availableVCStores}`,
          );
        }
      } else if (
        Array.isArray(parameter.options?.store) &&
        parameter.options?.store.length > 0
      ) {
        (parameter.options?.store as [string]).forEach((store) => {
          if (!isValidVCStore(store)) {
            console.error(
              `Invalid getVCs Params passed. "options.store" is not a valid store. The valid store is one of the following: ${availableVCStores}`,
            );
            throw new Error(
              `Invalid getVCs Params passed. "options.store" is not a valid store. The valid store is one of the following: ${availableVCStores}`,
            );
          }
        });
      } else {
        console.error(
          'Invalid getVCs Params passed. "options.store" is not in a valid format. It must either be a string or an array of strings',
        );
        throw new Error(
          'Invalid getVCs Params passed. "options.store" is not in a valid format. It must either be a string or an array of strings',
        );
      }
    }

    // Check if returnStore is valid
    if ('returnStore' in parameter.options) {
      if (
        !(
          'returnStore' in parameter.options &&
          parameter.options?.returnStore !== null &&
          typeof parameter.options?.returnStore === 'boolean'
        )
      ) {
        console.error(
          'Invalid getVCs Params passed. "options.returnStore" is not in a valid format. It must be a boolean',
        );
        throw new Error(
          'Invalid getVCs Params passed. "options.store" is not in a valid format. It must be a boolean',
        );
      }
    }
  }

  // Check if accessToken is valid
  if ('accessToken' in parameter) {
    if (
      !(
        parameter.accessToken !== null &&
        typeof parameter.accessToken === 'string'
      )
    ) {
      console.error(
        'Invalid getVCs Params passed. "accessToken" is not in a valid format. It must be a string',
      );
      throw new Error(
        'Invalid getVCs Params passed. "accessToken" is not in a valid format. It must be a string',
      );
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
  if (params === null || _.isEmpty(params)) {
    console.error(
      'Invalid saveVC Params passed. "data" must be passed as a parameter',
    );
    throw new Error(
      'Invalid saveVC Params passed. "data" must be passed as a parameter',
    );
  }

  const parameter = params as IDataManagerSaveArgs;

  if (
    'data' in parameter &&
    parameter.data !== null &&
    typeof parameter.data === 'object'
  ) {
    // Check if options is valid
    if (
      'options' in parameter &&
      parameter.options !== null &&
      typeof parameter.options === 'object'
    ) {
      if ('store' in parameter.options && parameter.options?.store !== null) {
        if (typeof parameter.options?.store === 'string') {
          if (!isValidVCStore(parameter.options?.store)) {
            console.error(
              `Invalid saveVC Params passed. "options.store" is not a valid store. The valid store is one of the following: ${availableVCStores}`,
            );
            throw new Error(
              `Invalid saveVC Params passed. "options.store" is not a valid store. The valid store is one of the following: ${availableVCStores}`,
            );
          }
        } else if (
          Array.isArray(parameter.options?.store) &&
          parameter.options?.store.length > 0
        ) {
          (parameter.options?.store as [string]).forEach((store) => {
            if (!isValidVCStore(store)) {
              console.error(
                `Invalid saveVC Params passed. "options.store" is not a valid store. The valid store is one of the following: ${availableVCStores}`,
              );
              throw new Error(
                `Invalid saveVC Params passed. "options.store" is not a valid store. The valid store is one of the following: ${availableVCStores}`,
              );
            }
          });
        } else {
          console.error(
            'Invalid saveVC Params passed. "options.store" is not in a valid format. It must either be a string or an array of strings',
          );
          throw new Error(
            'Invalid saveVC Params passed. "options.store" is not in a valid format. It must either be a string or an array of strings',
          );
        }
      }
    }

    // Check if accessToken is valid
    if ('accessToken' in parameter) {
      if (
        !(
          parameter.accessToken !== null &&
          typeof parameter.accessToken === 'string'
        )
      ) {
        console.error(
          'Invalid saveVC Params passed. "accessToken" is not in a valid format. It must be a string',
        );
        throw new Error(
          'Invalid saveVC Params passed. "accessToken" is not in a valid format. It must be a string',
        );
      }
    }
    return;
  }

  console.error(
    'Invalid saveVC Params passed. "data" must be passed as a parameter and it must be an object',
  );
  throw new Error(
    'Invalid saveVC Params passed. "data" must be passed as a parameter and it must be an object',
  );
}

/**
 * Check Validation of Create VC request.
 *
 * @param params - Request params.
 */
export function isValidCreateVCRequest(
  params: unknown,
): asserts params is CreateVCRequestParams {
  if (params === null || _.isEmpty(params)) {
    console.error(
      'Invalid createVC Params passed. "vcValue" must be passed as a parameter',
    );
    throw new Error(
      'Invalid createVC Params passed. "vcValue" must be passed as a parameter',
    );
  }

  const parameter = params as CreateVCRequestParams;

  if (
    'vcValue' in parameter &&
    parameter.vcValue !== null &&
    typeof parameter.vcValue === 'object'
  ) {
    // Check if vcKey is valid
    if ('vcKey' in parameter) {
      if (!(parameter.vcKey !== null && typeof parameter.vcKey === 'string')) {
        console.error(
          'Invalid createVC Params passed. "vcKey" is not in a valid format. It must be a string',
        );
        throw new Error(
          'Invalid createVC Params passed. "vcKey" is not in a valid format. It must be a string',
        );
      }
    }

    // Check if credTypes is valid
    if ('credTypes' in parameter) {
      if (
        !(
          parameter.credTypes !== null &&
          Array.isArray(parameter.credTypes) &&
          parameter.credTypes.length > 0
        )
      ) {
        console.error(
          'Invalid createVC Params passed. "credTypes" is not in a valid format. It must be an array of strings',
        );
        throw new Error(
          'Invalid createVC Params passed. "credTypes" is not in a valid format. It must be an array of strings',
        );
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
            console.error(
              `Invalid createVC Params passed. "options.store" is not a valid store. The valid store is one of the following: ${availableVCStores}`,
            );
            throw new Error(
              `Invalid createVC Params passed. "options.store" is not a valid store. The valid store is one of the following: ${availableVCStores}`,
            );
          }
        } else if (
          Array.isArray(parameter.options?.store) &&
          parameter.options?.store.length > 0
        ) {
          (parameter.options?.store as [string]).forEach((store) => {
            if (!isValidVCStore(store)) {
              console.error(
                `Invalid createVC Params passed. "options.store" is not a valid store. The valid store is one of the following: ${availableVCStores}`,
              );
              throw new Error(
                `Invalid createVC Params passed. "options.store" is not a valid store. The valid store is one of the following: ${availableVCStores}`,
              );
            }
          });
        } else {
          console.error(
            'Invalid createVC Params passed. "options.store" is not in a valid format. It must either be a string or an array of strings',
          );
          throw new Error(
            'Invalid createVC Params passed. "options.store" is not in a valid format. It must either be a string or an array of strings',
          );
        }
      }
    }

    // Check if accessToken is valid
    if ('accessToken' in parameter) {
      if (
        !(
          parameter.accessToken !== null &&
          typeof parameter.accessToken === 'string'
        )
      ) {
        console.error(
          'Invalid createVC Params passed. "accessToken" is not in a valid format. It must be a string',
        );
        throw new Error(
          'Invalid createVC Params passed. "accessToken" is not in a valid format. It must be a string',
        );
      }
    }
    return;
  }

  console.error(
    'Invalid saveVC Params passed. "data" must be passed as a parameter and it must be an object',
  );
  throw new Error(
    'Invalid saveVC Params passed. "data" must be passed as a parameter and it must be an object',
  );
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
  if (params === null || _.isEmpty(params)) {
    console.error(
      'Invalid verifyVC Params passed. "verifiableCredential" must be passed as a parameter',
    );
    throw new Error(
      'Invalid verifyVC Params passed. "verifiableCredential" must be passed as a parameter',
    );
  }

  const parameter = params as VerifyVCRequestParams;

  if (
    'verifiableCredential' in parameter &&
    parameter.verifiableCredential !== null &&
    typeof parameter.verifiableCredential === 'object'
  ) {
    return;
  }

  console.error(
    'Invalid verifyVC Params passed. "verifiableCredential" must be passed as a parameter and it must be an object',
  );
  throw new Error(
    'Invalid verifyVC Params passed. "verifiableCredential" must be passed as a parameter and it must be an object',
  );
}

/**
 * Check Validation of Remove VC request.
 *
 * @param params - Request params.
 */
export function isValidRemoveVCRequest(
  params: unknown,
): asserts params is IDataManagerDeleteArgs {
  if (params === null || _.isEmpty(params)) {
    console.error(
      'Invalid removeVC Params passed. "id" must be passed as a parameter',
    );
    throw new Error(
      'Invalid removeVC Params passed. "id" must be passed as a parameter',
    );
  }

  const parameter = params as IDataManagerDeleteArgs;

  // Check if id exists
  if ('id' in parameter && parameter.id !== null) {
    // Check if id is valid
    if (!Array.isArray(parameter.id) && !(typeof parameter.id === 'string')) {
      console.error(
        'Invalid removeVC Params passed. "id" must be a string or an array of strings',
      );
      throw new Error(
        'Invalid removeVC Params passed. "id" must be a string or an array of strings',
      );
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
            console.error(
              `Invalid removeVC Params passed. "options.store" is not a valid store. The valid store is one of the following: ${availableVCStores}`,
            );
            throw new Error(
              `Invalid removeVC Params passed. "options.store" is not a valid store. The valid store is one of the following: ${availableVCStores}`,
            );
          }
        } else if (
          Array.isArray(parameter.options?.store) &&
          parameter.options?.store.length > 0
        ) {
          (parameter.options?.store as [string]).forEach((store) => {
            if (!isValidVCStore(store)) {
              console.error(
                `Invalid removeVC Params passed. "options.store" is not a valid store. The valid store is one of the following: ${availableVCStores}`,
              );
              throw new Error(
                `Invalid removeVC Params passed. "options.store" is not a valid store. The valid store is one of the following: ${availableVCStores}`,
              );
            }
          });
        } else {
          console.error(
            'Invalid removeVC Params passed. "options.store" is not in a valid format. It must either be a string or an array of strings',
          );
          throw new Error(
            'Invalid removeVC Params passed. "options.store" is not in a valid format. It must either be a string or an array of strings',
          );
        }
      }
    }

    // Check if accessToken is valid
    if ('accessToken' in parameter) {
      if (
        !(
          parameter.accessToken !== null &&
          typeof parameter.accessToken === 'string'
        )
      ) {
        console.error(
          'Invalid removeVC Params passed. "accessToken" is not in a valid format. It must be a string',
        );
        throw new Error(
          'Invalid removeVC Params passed. "accessToken" is not in a valid format. It must be a string',
        );
      }
    }
    return;
  }

  console.error(
    'Invalid removeVC Params passed. "id" must be passed as a parameter',
  );
  throw new Error(
    'Invalid savremoveVCeVC Params passed. "id" must be passed as a parameter ',
  );
}

/**
 * Check Validation of Delete all VCs request.
 *
 * @param params - Request params.
 */
export function isValidDeleteAllVCsRequest(
  params: unknown,
): asserts params is IDataManagerClearArgs {
  if (params === null || _.isEmpty(params)) {
    return;
  }

  const parameter = params as IDataManagerClearArgs;

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
      console.error(
        'Invalid deleteAllVCs Params passed. "filter.type" is either missing or is not a string',
      );
      throw new Error(
        'Invalid deleteAllVCs Params passed. "filter.type" is either missing or is not a string',
      );
    }

    if (!('filter' in parameter.filter && parameter.filter?.filter !== null)) {
      console.error(
        'Invalid deleteAllVCs Params passed. "filter.filter" is missing',
      );
      throw new Error(
        'Invalid deleteAllVCs Params passed. "filter.filter" is missing',
      );
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
          console.error(
            `Invalid deleteAllVCs Params passed. "options.store" is not a valid store. The valid store is one of the following: ${availableVCStores}`,
          );
          throw new Error(
            `Invalid deleteAllVCs Params passed. "options.store" is not a valid store. The valid store is one of the following: ${availableVCStores}`,
          );
        }
      } else if (
        Array.isArray(parameter.options?.store) &&
        parameter.options?.store.length > 0
      ) {
        (parameter.options?.store as [string]).forEach((store) => {
          if (!isValidVCStore(store)) {
            console.error(
              `Invalid deleteAllVCs Params passed. "options.store" is not a valid store. The valid store is one of the following: ${availableVCStores}`,
            );
            throw new Error(
              `Invalid deleteAllVCs Params passed. "options.store" is not a valid store. The valid store is one of the following: ${availableVCStores}`,
            );
          }
        });
      } else {
        console.error(
          'Invalid deleteAllVCs Params passed. "options.store" is not in a valid format. It must either be a string or an array of strings',
        );
        throw new Error(
          'Invalid deleteAllVCs Params passed. "options.store" is not in a valid format. It must either be a string or an array of strings',
        );
      }
    }

    // Check if accessToken is valid
    if ('accessToken' in parameter) {
      if (
        !(
          parameter.accessToken !== null &&
          typeof parameter.accessToken === 'string'
        )
      ) {
        console.error(
          'Invalid deleteAllVCs Params passed. "accessToken" is not in a valid format. It must be a string',
        );
        throw new Error(
          'Invalid deleteAllVCs Params passed. "accessToken" is not in a valid format. It must be a string',
        );
      }
    }
  }
}

/**
 * Check Validation of Create VP request.
 *
 * @param params - Request params.
 */
export function isValidCreateVPRequest(
  params: unknown,
): asserts params is CreateVPRequestParams {
  if (params === null || _.isEmpty(params)) {
    console.error(
      'Invalid createVP Params passed. "vcIds" or "vcs" must be passed as a parameter',
    );
    throw new Error(
      'Invalid createVP Params passed. "vcIds" or "vcs" must be passed as a parameter',
    );
  }

  const parameter = params as CreateVPRequestParams;

  // Check if vcIds is valid
  if (
    'vcIds' in parameter &&
    parameter.vcs !== null &&
    Array.isArray(parameter.vcs)
  ) {
    (parameter.vcIds as [string]).forEach((vcId) => {
      // Check if vcId is valid
      if (!(vcId !== null && typeof vcId === 'string')) {
        console.error(
          `Invalid createVP Params passed. vcId: '${vcId}' is not in a valid format. It must be a string`,
        );
        throw new Error(
          `Invalid createVP Params passed. vcId: '${vcId}' is not in a valid format. It must be a string`,
        );
      }
    });
  }

  // Check if vcs is valid
  if (
    'vcIds' in parameter &&
    parameter.vcs !== null &&
    Array.isArray(parameter.vcs)
  ) {
    (parameter.vcs as [string]).forEach((vc) => {
      // Check if vc is valid
      if (!(vc !== null && typeof vc === 'object')) {
        console.error(
          'Invalid createVP Params passed. One of the vcs that was passed is not in a valid format. It must be an object',
        );
        throw new Error(
          'Invalid createVP Params passed. One of the vcs that was passed is not in a valid format. It must be an object',
        );
      }
    });
  }

  // Check if proofInfo is valid
  if (
    'proofInfo' in parameter &&
    parameter.proofInfo !== null &&
    typeof parameter.proofInfo === 'object'
  ) {
    // Check if proofFormat is valid
    if (
      'proofFormat' in parameter.proofInfo &&
      parameter.proofInfo.proofFormat !== null &&
      !isValidProofFormat(parameter.proofInfo.proofFormat as string)
    ) {
      console.error(
        `Invalid createVP Params passed. Proofformat '${parameter.proofInfo.proofFormat}' not supported. The supported proof formats are: ${availableProofFormats}`,
      );
      throw new Error(
        `Invalid createVP Params passed. Proofformat '${parameter.proofInfo.proofFormat}' not supported. The supported proof formats are: ${availableProofFormats}`,
      );
    }

    // Check if type is a string
    if (
      'type' in parameter.proofInfo &&
      parameter.proofInfo.type !== null &&
      typeof parameter.proofInfo.type !== 'string'
    ) {
      console.error(
        'Invalid createVP Params passed. "proofInfo.type" is not in a valid format. It must be a string',
      );
      throw new Error(
        'Invalid createVP Params passed. "proofInfo.type" is not in a valid format. It must be a string',
      );
    }

    // Check if domain is a string
    if (
      'domain' in parameter.proofInfo &&
      parameter.proofInfo.domain !== null &&
      typeof parameter.proofInfo.domain !== 'string'
    ) {
      console.error(
        'Invalid createVP Params passed. "proofInfo.domain" is not in a valid format. It must be a string',
      );
      throw new Error(
        'Invalid createVP Params passed. "proofInfo.domain" is not in a valid format. It must be a string',
      );
    }

    // Check if challenge is a string
    if (
      'challenge' in parameter.proofInfo &&
      parameter.proofInfo.challenge !== null &&
      typeof parameter.proofInfo.challenge !== 'string'
    ) {
      console.error(
        'Invalid createVP Params passed. "proofInfo.challenge" is not in a valid format. It must be a string',
      );
      throw new Error(
        'Invalid createVP Params passed. "proofInfo.challenge" is not in a valid format. It must be a string',
      );
    }
  }
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
  if (params === null || _.isEmpty(params)) {
    console.error(
      'Invalid verifyVP Params passed. "verifiablePresentation" must be passed as a parameter',
    );
    throw new Error(
      'Invalid verifyVP Params passed. "verifiablePresentation" must be passed as a parameter',
    );
  }

  const parameter = params as VerifyVPRequestParams;

  if (
    'verifiablePresentation' in parameter &&
    parameter.verifiablePresentation !== null &&
    typeof parameter.verifiablePresentation === 'object'
  ) {
    return;
  }

  console.error(
    'Invalid verifyVP Params passed. "verifiablePresentation" must be passed as a parameter and it must be an object',
  );
  throw new Error(
    'Invalid verifyVP Params passed. "verifiablePresentation" must be passed as a parameter and it must be an object',
  );
}

/**
 * Check Validation of Configure google request.
 *
 * @param params - Request params.
 */
export function isValidConfigueGoogleRequest(
  params: unknown,
): asserts params is GoogleToken {
  if (params === null || _.isEmpty(params)) {
    console.error(
      'Invalid configureGoogleAccount Params passed. "accessToken" must be passed as a parameter',
    );
    throw new Error(
      'Invalid configureGoogleAccount Params passed. "accessToken" must be passed as a parameter',
    );
  }

  const parameter = params as GoogleToken;

  if (
    'accessToken' in parameter &&
    parameter.accessToken !== null &&
    typeof parameter.accessToken === 'string'
  ) {
    return;
  }

  console.error(
    'Invalid configureGoogleAccount Params passed. "accessToken" must be passed as a parameter and it must be a string',
  );
  throw new Error(
    'Invalid configureGoogleAccount Params passed. "accessToken" must be passed as a parameter and it must be a string',
  );
}
