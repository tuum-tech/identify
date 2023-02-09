/* eslint-disable */
import { OnRpcRequestHandler } from '@metamask/snap-types';
import { getAvailableMethods } from './rpc/did/getAvailableMethods';
import { getDid } from './rpc/did/getDID';
import { resolveDID } from './rpc/did/resolveDID';
import { switchMethod } from './rpc/did/switchMethods';
import { connectHederaAccount } from './rpc/hedera/connectHederaAccount';
import {
  configureGoogleAccount,
  uploadToGoogleDrive,
} from './rpc/store/gdrive';
import { createVC } from './rpc/vc/createVC';
import { createVP } from './rpc/vc/createVP';
import { deleteAllVCs } from './rpc/vc/deleteAllVCs';
import { getSupportedProofFormats } from './rpc/vc/getSupportedProofFormats';
import { getVCs } from './rpc/vc/getVCs';
import { removeVC } from './rpc/vc/removeVC';
import { saveVC } from './rpc/vc/saveVC';
import { syncGoogleVCs } from './rpc/vc/syncGoogleVCs';
import { verifyVC } from './rpc/vc/verifyVC';
import { verifyVP } from './rpc/vc/verifyVP';
import { init } from './utils/init';
import { switchNetworkIfNecessary } from './utils/network';
import {
  isValidConfigueGoogleRequest,
  isValidCreateVCRequest,
  isValidCreateVPRequest,
  isValidDeleteAllVCsRequest,
  isValidGetVCsRequest,
  isValidHederaAccountParams,
  isValidRemoveVCRequest,
  isValidResolveDIDRequest,
  isValidSaveVCRequest,
  isValidSwitchMethodRequest,
  isValidUploadDataRequest,
  isValidVerifyVCRequest,
  isValidVerifyVPRequest,
} from './utils/params';
import { getCurrentAccount } from './utils/snapUtils';
import { getSnapStateUnchecked, initAccountState } from './utils/stateUtils';

/**
 * Get a message from the origin. For demonstration purposes only.
 *
 * @param originString - The origin string.
 * @returns A message based on the origin.
 */
export const getMessage = (originString: string): string =>
  `Hello, ${originString}!`;

/**
 * Handle incoming JSON-RPC requests, sent through `wallet_invokeSnap`.
 *
 * @param args - The request handler args as object.
 * @param args.origin - The origin of the request, e.g., the website that
 * invoked the snap.
 * @param args.request - A validated JSON-RPC request object.
 * @returns `null` if the request succeeded.
 * @throws If the request method is not valid for this snap.
 * @throws If the `snap_confirm` call failed.
 */
export const onRpcRequest: OnRpcRequestHandler = async ({
  origin,
  request,
}) => {
  let state = await getSnapStateUnchecked(wallet);

  if (state === null) {
    state = await init(wallet);
  }
  console.log('state:', JSON.stringify(state, null, 4));

  /* 
    We will need to call this API before trying to get the account because sometimes when connecting to hedera,
    the account may be null but to set the account, we need to call this API so it's a chicken and egg problem.
    To avoid the error, we are calling this method in the beginning 
    To set the account for Hedera, we need to set the private key and the accountId first
   */
  if (request.method == 'connectHederaAccount') {
    isValidHederaAccountParams(request.params);
    return connectHederaAccount(
      state,
      request.params.privateKey,
      request.params.accountId,
    );
  }
  const account = await getCurrentAccount(wallet, state);
  console.log('account:', account);

  // FIXME: HANDLE NULL maybe throw ?
  if (account === null) {
    throw new Error(
      'Error while trying to get the account. Please connect to an account first',
    );
  } else {
    state.currentAccount = account;
  }

  if (!(account in state.accountState)) {
    await initAccountState(wallet, state, account);
  }

  console.log('Request:', JSON.stringify(request, null, 4));
  console.log('Origin:', origin);
  console.log('-------------------------------------------------------------');
  console.log(
    'request.params=========',
    JSON.stringify(request.params, null, 4),
  );

  switch (request.method) {
    case 'hello':
      return wallet.request({
        method: 'snap_confirm',
        params: [
          {
            prompt: getMessage(origin),
            description: 'This is what description will look like',
            textAreaContent: 'This is what content will look like',
          },
        ],
      });

    case 'switchMethod':
      isValidSwitchMethodRequest(request.params);
      return await switchMethod(wallet, state, request.params.didMethod);
    case 'getDID':
      await switchNetworkIfNecessary(wallet, state);
      return await getDid(wallet, state);
    case 'resolveDID':
      isValidResolveDIDRequest(request.params);
      await switchNetworkIfNecessary(wallet, state);
      return await resolveDID(wallet, state, request.params.did);
    case 'getVCs':
      isValidGetVCsRequest(request.params);
      await switchNetworkIfNecessary(wallet, state);
      return await getVCs(wallet, state, request.params);
    case 'saveVC':
      isValidSaveVCRequest(request.params);
      await switchNetworkIfNecessary(wallet, state);
      return await saveVC(wallet, state, request.params);
    case 'createVC':
      isValidCreateVCRequest(request.params);
      await switchNetworkIfNecessary(wallet, state);
      return await createVC(wallet, state, request.params);
    case 'verifyVC':
      isValidVerifyVCRequest(request.params);
      await switchNetworkIfNecessary(wallet, state);
      return await verifyVC(wallet, state, request.params.verifiableCredential);
    case 'removeVC':
      isValidRemoveVCRequest(request.params);
      await switchNetworkIfNecessary(wallet, state);
      return await removeVC(wallet, state, request.params);
    case 'deleteAllVCs':
      isValidDeleteAllVCsRequest(request.params);
      await switchNetworkIfNecessary(wallet, state);
      return await deleteAllVCs(wallet, state, request.params);
    case 'createVP':
      isValidCreateVPRequest(request.params);
      await switchNetworkIfNecessary(wallet, state);
      return await createVP(wallet, state, request.params);
    case 'verifyVP':
      isValidVerifyVPRequest(request.params);
      await switchNetworkIfNecessary(wallet, state);
      return await verifyVP(
        wallet,
        state,
        request.params.verifiablePresentation,
      );
    case 'getCurrentDIDMethod':
      await switchNetworkIfNecessary(wallet, state);
      return state.accountState[state.currentAccount].accountConfig.identity
        .didMethod;
    case 'getAvailableMethods':
      return getAvailableMethods();
    case 'getSupportedProofFormats':
      return getSupportedProofFormats();
    case 'configureGoogleAccount':
      isValidConfigueGoogleRequest(request.params);
      return await configureGoogleAccount(wallet, state, request.params);
    case 'uploadToGoogleDrive':
      isValidUploadDataRequest(request.params);
      return await uploadToGoogleDrive(state, request.params.uploadData);
    case 'syncGoogleVCs':
      return await syncGoogleVCs(wallet, state);
    default:
      console.error('Method not found');
      throw new Error('Method not found');
  }
};
