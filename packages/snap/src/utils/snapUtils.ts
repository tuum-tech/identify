import { getBIP44AddressKeyDeriver } from '@metamask/key-tree';
import { SnapProvider } from '@metamask/snap-types';
import * as ethers from 'ethers';
import { IdentitySnapState, SnapConfirmParams } from '../interfaces';
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
  wallet: SnapProvider
): Promise<string | null> {
  try {
    const accounts = (await wallet.request({
      method: 'eth_requestAccounts',
    })) as Array<string>;
    console.log('MetaMask accounts', accounts);
    return accounts[0];
  } catch (e) {
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
 *  Generate the public key for the current account using personal_sign.
 *
 * @returns {Promise<string>} - returns public key for current account
 */
export async function getPublicKey(
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
    throw new Error('User denied request');
  }

  const message = 'getPublicKey';
  const msgHash = ethers.utils.hashMessage(message);
  const msgHashBytes = ethers.utils.arrayify(msgHash);

  return ethers.utils.recoverPublicKey(msgHashBytes, signedMsg);
}

/**
 *  Get the private key for the current account using snap_getBip44Entropy.
 *
 * @returns {Promise<string>} - returns private key for current account
 */
export async function getPrivateKey(wallet: SnapProvider): Promise<string> {
  console.log('wallet: ', wallet);
  // coin_type 3030 = HBAR. Refer to https://github.com/satoshilabs/slips/blob/master/slip-0044.md
  const hbarNode: any = await wallet.request({
    method: 'snap_getBip44Entropy',
    params: {
      coinType: 3030,
    },
  });
  console.log('hbarNode: ', hbarNode);

  // Next, we'll create an address key deriver function for the Dogecoin coin_type node.
  // In this case, its path will be: m / 44' / 3' / 0' / 0 / address_index
  const deriveHbarAddress = await getBIP44AddressKeyDeriver(hbarNode);
  console.log('deriveHbarAddress:', deriveHbarAddress);

  // These are BIP-44 nodes containing the extended private keys for
  // the respective derivation paths.

  // m / 44' / 3' / 0' / 0 / 0
  const addressKey0 = await deriveHbarAddress(0);
  console.log('addressKey0:', addressKey0);
  if (addressKey0.privateKey) {
    console.log('addressKey0.privateKey:', addressKey0.privateKey);
    return addressKey0.privateKey;
  } else return '';
}

export async function snapConfirm(
  wallet: SnapProvider,
  params: SnapConfirmParams
): Promise<boolean> {
  return (await wallet.request({
    method: 'snap_confirm',
    params: [params],
  })) as boolean;
}
