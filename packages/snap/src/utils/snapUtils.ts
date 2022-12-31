import { SnapProvider } from '@metamask/snap-types';
import { IdentitySnapState, SnapConfirmParams } from '../interfaces';
import { getHederaChainIDs } from './config';
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
  wallet: SnapProvider,
  state: IdentitySnapState
): Promise<string | null> {
  try {
    if (
      wallet.selectedAddress &&
      wallet.selectedAddress !== state.currentAccount
    ) {
      state.currentAccount = wallet.selectedAddress;
      await updateSnapState(wallet, state);
    }

    const chain_id = await getCurrentNetwork(wallet);
    const hederaChainIDs = getHederaChainIDs();
    if (Array.from(hederaChainIDs.keys()).includes(chain_id)) {
      // Handle Hedera
      if (isHederaAccountImported(state)) {
        console.log(
          `Hedera Metamask accounts: EVM Address: ${state.hederaAccount.evmAddress}, AccountId: ${state.hederaAccount.accountId}`
        );
        return state.hederaAccount.accountId;
      } else {
        console.error(
          'Hedera Network was selected but Hedera Account has not yet been configured. Please configure it first by calling "configureHederaAccount" API'
        );
        return null;
      }
    } else {
      // Handle everything else
      const accounts = (await wallet.request({
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

export async function getCurrentNetwork(wallet: SnapProvider): Promise<string> {
  return (await wallet.request({
    method: 'eth_chainId',
  })) as string;
}

/**
 * Function that toggles the disablePopups flag in the config.
 *
 */
export async function togglePopups(
  wallet: SnapProvider,
  state: IdentitySnapState
) {
  state.snapConfig.dApp.disablePopups = !state.snapConfig.dApp.disablePopups;
  await updateSnapState(wallet, state);
}

/**
 * Function that lets you add a friendly dApp
 *
 */
export async function addFriendlyDapp(
  wallet: SnapProvider,
  state: IdentitySnapState,
  dapp: string
) {
  state.snapConfig.dApp.friendlyDapps.push(dapp);
  await updateSnapState(wallet, state);
}

/**
 * Function that removes a friendly dApp.
 *
 */
export async function removeFriendlyDapp(
  wallet: SnapProvider,
  state: IdentitySnapState,
  dapp: string
) {
  // FIXME: TEST IF YOU CAN REFERENCE FRIENDLY DAPS
  // let friendlyDapps = state.snapConfig.dApp.friendlyDapps;
  // friendlyDapps = friendlyDapps.filter((d) => d !== dapp);
  state.snapConfig.dApp.friendlyDapps =
    state.snapConfig.dApp.friendlyDapps.filter((d) => d !== dapp);
  await updateSnapState(wallet, state);
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
  wallet: SnapProvider,
  params: SnapConfirmParams
): Promise<boolean> {
  return (await wallet.request({
    method: 'snap_confirm',
    params: [params],
  })) as boolean;
}
