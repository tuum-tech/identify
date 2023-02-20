/* eslint-disable */
import { OnRpcRequestHandler } from '@metamask/snaps-types';
import { divider, heading, panel, text } from '@metamask/snaps-ui';
import { IdentitySnapParams } from './interfaces';
import { getAvailableMethods } from './rpc/did/getAvailableMethods';
import { getDid } from './rpc/did/getDID';
import { resolveDID } from './rpc/did/resolveDID';
import { switchMethod } from './rpc/did/switchMethods';
import { configureGoogleAccount } from './rpc/gdrive/configureGoogleAccount';
import { connectHederaAccount } from './rpc/hedera/connectHederaAccount';
import { getHederaAccountId } from './rpc/hedera/getHederaAccountId';
import { togglePopups } from './rpc/snap/togglePopups';
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
const getMessage = (): string => `Hello, Identity Snap User!`;

/**
 * Handle incoming JSON-RPC requests, sent through `wallet_invokeSnap`.
 *
 * @param args - The request handler args as object.
 * @param args.request - A validated JSON-RPC request object.
 * @returns `null` if the request succeeded.
 * @throws If the request method is not valid for this snap.
 */
export const onRpcRequest: OnRpcRequestHandler = async ({ request }) => {
  let state = await getSnapStateUnchecked(snap);

  if (state === null) {
    state = await init(snap);
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
    return await connectHederaAccount(
      snap,
      state,
      ethereum,
      request.params.privateKey,
      request.params.accountId,
    );
  }
  const account = await getCurrentAccount(state, ethereum);
  console.log('account:', account);

  // FIXME: HANDLE NULL maybe throw ?
  if (account === null) {
    throw new Error(
      'Error while trying to get the account. Please connect to an account first',
    );
  } else {
    state.currentAccount = account;
  }

  const identitySnapParams: IdentitySnapParams = {
    snap,
    state,
    metamask: ethereum,
  };

  if (!(account in state.accountState)) {
    await initAccountState(snap, state, state.currentAccount);
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
      return snap.request({
        method: 'snap_dialog',
        params: {
          type: 'Alert', // Type can be 'Alert', 'Confirmation' or 'Prompt'
          content: panel([
            heading('This is what the header looks like'),
            text('This is what text area looks like before the divider'),
            divider(),
            text('This is what text area looks like after the divider'),
          ]),
        },
      });
    case 'togglePopups':
      return await togglePopups(identitySnapParams);
    case 'getDID':
      await switchNetworkIfNecessary(identitySnapParams);
      return await getDid(identitySnapParams);
    case 'resolveDID':
      isValidResolveDIDRequest(request.params);
      await switchNetworkIfNecessary(identitySnapParams);
      return await resolveDID(identitySnapParams, request.params.did);
    case 'getVCs':
      isValidGetVCsRequest(request.params);
      await switchNetworkIfNecessary(identitySnapParams);
      return await getVCs(identitySnapParams, request.params);
    case 'saveVC':
      isValidSaveVCRequest(request.params);
      await switchNetworkIfNecessary(identitySnapParams);
      return await saveVC(identitySnapParams, request.params);
    case 'createVC':
      isValidCreateVCRequest(request.params);
      await switchNetworkIfNecessary(identitySnapParams);
      return await createVC(identitySnapParams, request.params);
    case 'verifyVC':
      isValidVerifyVCRequest(request.params);
      await switchNetworkIfNecessary(identitySnapParams);
      return await verifyVC(
        identitySnapParams,
        request.params.verifiableCredential,
      );
    case 'removeVC':
      isValidRemoveVCRequest(request.params);
      await switchNetworkIfNecessary(identitySnapParams);
      return await removeVC(identitySnapParams, request.params);
    case 'deleteAllVCs':
      isValidDeleteAllVCsRequest(request.params);
      await switchNetworkIfNecessary(identitySnapParams);
      return await deleteAllVCs(identitySnapParams, request.params);
    case 'createVP':
      isValidCreateVPRequest(request.params);
      await switchNetworkIfNecessary(identitySnapParams);
      return await createVP(identitySnapParams, request.params);
    case 'verifyVP':
      isValidVerifyVPRequest(request.params);
      await switchNetworkIfNecessary(identitySnapParams);
      return await verifyVP(
        identitySnapParams,
        request.params.verifiablePresentation,
      );
    case 'getAvailableMethods':
      return getAvailableMethods();
    case 'getCurrentDIDMethod':
      await switchNetworkIfNecessary(identitySnapParams);
      return state.accountState[state.currentAccount].accountConfig.identity
        .didMethod;
    case 'switchMethod':
      isValidSwitchMethodRequest(request.params);
      return await switchMethod(identitySnapParams, request.params.didMethod);
    case 'getSupportedProofFormats':
      return getSupportedProofFormats();
    case 'configureGoogleAccount':
      isValidConfigueGoogleRequest(request.params);
      return await configureGoogleAccount(identitySnapParams, request.params);
    case 'syncGoogleVCs':
      return await syncGoogleVCs(identitySnapParams);
    case 'getHederaAccountId':
      return await getHederaAccountId(identitySnapParams);
    default:
      console.error('Method not found');
      throw new Error('Method not found');
  }
};
