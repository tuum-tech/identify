import { MetaMaskInpageProvider } from '@metamask/providers';
import { SnapsGlobalObject } from '@metamask/snaps-types';
import { validHederaChainID } from '../hedera/config';
import { IdentitySnapState, SnapConfirmParams } from '../interfaces';
import { isHederaAccountImported } from './params';
import { updateSnapState } from './stateUtils';

/* eslint-disable */
/**
 * Function that returns address of the currently selected MetaMask account.
 *
 * @private
 *
 * @returns {Promise<string>} address - MetaMask address
 *
 *
 **/
export async function getCurrentAccount(
  state: IdentitySnapState,
  metamask: MetaMaskInpageProvider
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
          }`
        );
        return state.accountState[state.currentAccount].hederaAccount
          .evmAddress;
      } else {
        console.error(
          'Hedera Network was selected but Hedera Account has not yet been configured. Please configure it first by calling "configureHederaAccount" API'
        );
        return null;
      }
    } else {
      // Handle everything else
      const accounts = (await metamask.request({
        method: 'eth_requestAccounts',
      })) as Array<string>;
      console.log(`MetaMask accounts: EVM Address: ${accounts}`);
      return accounts[0];
    }
  } catch (e) {
    console.error(`Error while trying to get the account: ${e}`);
    return null;
  }
}

export async function getCurrentNetwork(
  metamask: MetaMaskInpageProvider
): Promise<string> {
  return (await metamask.request({
    method: 'eth_chainId',
  })) as string;
}

/**
 * Function that toggles the disablePopups flag in the config.
 *
 */
export async function updatePopups(
  snap: SnapsGlobalObject,
  state: IdentitySnapState
) {
  state.snapConfig.dApp.disablePopups = !state.snapConfig.dApp.disablePopups;
  await updateSnapState(snap, state);
}

/**
 * Function that lets you add a friendly dApp
 *
 */
export async function addFriendlyDapp(
  snap: SnapsGlobalObject,
  state: IdentitySnapState,
  dapp: string
) {
  state.snapConfig.dApp.friendlyDapps.push(dapp);
  await updateSnapState(snap, state);
}

/**
 * Function that removes a friendly dApp.
 *
 */
export async function removeFriendlyDapp(
  snap: SnapsGlobalObject,
  state: IdentitySnapState,
  dapp: string
) {
  // FIXME: TEST IF YOU CAN REFERENCE FRIENDLY DAPS
  // let friendlyDapps = state.snapConfig.dApp.friendlyDapps;
  // friendlyDapps = friendlyDapps.filter((d) => d !== dapp);
  state.snapConfig.dApp.friendlyDapps =
    state.snapConfig.dApp.friendlyDapps.filter((d) => d !== dapp);
  await updateSnapState(snap, state);
}

/**
 *  UNUSEDFUNCTION
 *  Generate the public key for the current account using personal_sign.
 *
 * @returns {Promise<string>} - returns public key for current account
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

export async function snapConfirm(
  snap: SnapsGlobalObject,
  params: SnapConfirmParams
): Promise<boolean> {
  return (await snap.request({
    method: 'snap_confirm',
    params: [params],
  })) as boolean;
}
