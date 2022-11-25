/* eslint-disable */
import { OnRpcRequestHandler } from '@metamask/snap-types';
import { getAccountInfo } from './hedera/hederaSdk';
import { init } from './utils/init';
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
  console.log('state: ', state);

  if (state === null) {
    state = await init(wallet);
  }

  const account = await getCurrentAccount(wallet);
  console.log('account: ', account);

  // FIXME: HANDLE NULL maybe throw ?
  if (account === null) {
    return;
  }

  if (!(account in state.accountState)) {
    await initAccountState(wallet, state, account);
  }

  console.log('Request:', request);
  console.log('Origin:', origin);
  console.log('-------------------------------------------------------------');

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
    case 'getDID':
      console.log('Trying to call getDID API');
      const info = await getAccountInfo(state, account);
      return info;
    /* case 'getDID':
      const did = await getDid(wallet, state, account);
      console.log('DID: ', did);
      return did; */
    default:
      throw new Error('Method not found.');
  }
};
