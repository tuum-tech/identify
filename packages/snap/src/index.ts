/* eslint-disable */
import { OnRpcRequestHandler } from '@metamask/snap-types';
import { getAvailableMethods } from './rpc/did/getAvailableMethods';
import { getDid } from './rpc/did/getDID';
import { switchMethod } from './rpc/did/switchMethods';
import { getVCs } from './rpc/vc/getVCs';
import { init } from './utils/init';
import { switchNetworkIfNecessary } from './utils/network';
import {
  isValidGetVCsRequest,
  isValidHederaAccountParams,
  isValidSwitchMethodRequest,
} from './utils/params';
import { configureHederaAccount, getCurrentAccount } from './utils/snapUtils';
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
  console.log('state:', state);

  const account = await getCurrentAccount(wallet, state);
  console.log('account:', account);

  // FIXME: HANDLE NULL maybe throw ?
  if (account === null) {
    return;
  } else {
    state.currentAccount = account;
  }

  if (!(account in state.accountState)) {
    await initAccountState(wallet, state);
  }

  console.log('Request:', request);
  console.log('Origin:', origin);
  console.log('-------------------------------------------------------------');
  console.log('request.params=========', request.params);

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
    // You need to first configure the hedera account before any other APIs can be called because
    // we need to set the private key and the accountId of a hedera account
    case 'configureHederaAccount':
      isValidHederaAccountParams(request.params);
      return configureHederaAccount(
        state,
        request.params.privateKey,
        request.params.accountId
      );
    case 'switchMethod':
      isValidSwitchMethodRequest(request.params);
      return await switchMethod(wallet, state, request.params.didMethod);
    case 'getDID':
      await switchNetworkIfNecessary(wallet, state);
      return await getDid(wallet, state);
    case 'getVCs':
      isValidGetVCsRequest(request.params);
      return await getVCs(wallet, state, account, request.params.query);
    case 'getCurrentDIDMethod':
      await switchNetworkIfNecessary(wallet, state);
      return state.accountState[state.currentAccount].accountConfig.identity
        .didMethod;
    case 'getAvailableMethods':
      return getAvailableMethods();
    default:
      throw new Error('Method not found.');
  }
};
