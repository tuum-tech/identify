import { MetaMaskInpageProvider } from '@metamask/providers';
import { SnapsGlobalObject } from '@metamask/snaps-types';
import { validHederaChainID } from '../hedera/config';
import { IdentitySnapState, SnapDialogParams } from '../interfaces';
import { isHederaAccountImported } from './params';
import { updateSnapState } from './stateUtils';

/**
 * Function that returns address of the currently selected MetaMask account.
 *
 * @param state - IdentitySnapState.
 * @param metamask - Metamask provider.
 * @private
 * @returns MetaMask address.
 */
export async function getCurrentAccount(
  state: IdentitySnapState,
  metamask: MetaMaskInpageProvider,
): Promise<string | null> {
  try {
    const chainId = await getCurrentNetwork(metamask);
    if (validHederaChainID(chainId)) {
      // Handle Hedera
      if (isHederaAccountImported(state)) {
        console.log(
          `Hedera Metamask accounts: EVM Address: ${
            state.accountState[state.currentAccount].hederaAccount.evmAddress
          }, AccountId: ${
            state.accountState[state.currentAccount].hederaAccount.accountId
          }`,
        );
        return state.accountState[state.currentAccount].hederaAccount
          .evmAddress;
      }

      console.error(
        'Hedera Network was selected but Hedera Account has not yet been configured. Please configure it first by calling "configureHederaAccount" API',
      );
      return null;
    }
    // Handle everything else
    const accounts = (await metamask.request({
      method: 'eth_requestAccounts',
    })) as string[];
    console.log(`MetaMask accounts: EVM Address: ${accounts}`);
    return accounts[0];
  } catch (e) {
    console.error(`Error while trying to get the account: ${e}`);
    return null;
  }
}

/**
 * Get current network.
 *
 * @param metamask - Metamask provider.
 */
export async function getCurrentNetwork(
  metamask: MetaMaskInpageProvider,
): Promise<string> {
  return (await metamask.request({
    method: 'eth_chainId',
  })) as string;
}

/**
 * Function that toggles the disablePopups flag in the config.
 *
 * @param snap - Snap.
 * @param state - IdentitySnapState.
 */
export async function updatePopups(
  snap: SnapsGlobalObject,
  state: IdentitySnapState,
) {
  state.snapConfig.dApp.disablePopups = !state.snapConfig.dApp.disablePopups;
  await updateSnapState(snap, state);
}

/**
 * Function that lets you add a friendly dApp.
 *
 * @param snap - Snap.
 * @param state - IdentitySnapState.
 * @param dapp - Dapp.
 */
export async function addFriendlyDapp(
  snap: SnapsGlobalObject,
  state: IdentitySnapState,
  dapp: string,
) {
  state.snapConfig.dApp.friendlyDapps.push(dapp);
  await updateSnapState(snap, state);
}

/**
 * Function that removes a friendly dApp.
 *
 * @param snap - Snap.
 * @param state - IdentitySnapState.
 * @param dapp - Dapp.
 */
export async function removeFriendlyDapp(
  snap: SnapsGlobalObject,
  state: IdentitySnapState,
  dapp: string,
) {
  // FIXME: TEST IF YOU CAN REFERENCE FRIENDLY DAPS
  // let friendlyDapps = state.snapConfig.dApp.friendlyDapps;
  // friendlyDapps = friendlyDapps.filter((d) => d !== dapp);
  state.snapConfig.dApp.friendlyDapps =
    state.snapConfig.dApp.friendlyDapps.filter((d) => d !== dapp);
  await updateSnapState(snap, state);
}

/**
 * UNUSEDFUNCTION
 * Generate the public key for the current account using personal_sign.
 *
 * @returns {Promise<string>} returns public key for current account
 */
/* export async function getPublicKey(
  wallet: SnapProvider,
  state: IdentitySnapState,
  account: string
): Promise<string> {
  if (state.accountState[account].publicKey !== '')
    return state.accountState[account].publicKey;

  let signedMsg;
  try {
    signedMsg = (await wallet.request({
      method: 'personal_sign',
      params: ['getPublicKey', account],
    })) as string;
  } catch (err) {
    console.error('User denied request');
    throw new Error('User denied request');
  }

  const message = 'getPublicKey';
  const msgHash = ethers.utils.hashMessage(message);
  const msgHashBytes = ethers.utils.arrayify(msgHash);

  return ethers.utils.recoverPublicKey(msgHashBytes, signedMsg);
} */

/**
 * Function that opens snap dialog.
 *
 * @param snap - Snap.
 * @param params - Snap dialog params.
 */
export async function snapDialog(
  snap: SnapsGlobalObject,
  params: SnapDialogParams,
): Promise<string | boolean | null> {
  return (await snap.request({
    method: 'snap_dialog',
    params,
  })) as boolean;
}
