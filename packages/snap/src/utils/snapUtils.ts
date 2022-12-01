import { AccountId, PrivateKey } from '@hashgraph/sdk';
import { SnapProvider } from '@metamask/snap-types';
import { HederaServiceImpl } from '../hedera';
import { WalletHedera } from '../hedera/wallet/abstract';
import { PrivateKeySoftwareWallet } from '../hedera/wallet/software-private-key';
import { IdentitySnapState, SnapConfirmParams } from '../interfaces';
import { getHederaChainIDs } from './config';
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

export async function configureHederaAccount(
  state: IdentitySnapState,
  _privateKey: string,
  _accountId: string
): Promise<boolean> {
  const hederaChainIDs = getHederaChainIDs();
  const chain_id = await getCurrentNetwork(wallet);
  if (Array.from(hederaChainIDs.keys()).includes(chain_id)) {
    const accountId = AccountId.fromString(_accountId);
    const privateKey = PrivateKey.fromStringECDSA(_privateKey);
    const publicKey = privateKey.publicKey;
    const walletHedera: WalletHedera = new PrivateKeySoftwareWallet(privateKey);
    const hedera = new HederaServiceImpl();

    const client = await hedera.createClient({
      walletHedera,
      keyIndex: 0,
      accountId: accountId,
      network: hederaChainIDs.get(chain_id) as string,
    });
    if (client != null) {
      state.hederaAccount.privateKey = _privateKey;
      state.hederaAccount.publicKey = publicKey.toStringRaw();
      state.hederaAccount.accountId = _accountId;
      await updateSnapState(wallet, state);
      return true;
    } else {
      console.error('Invalid private key or account Id');
      return false;
    }
  } else {
    console.error(
      'Invalid Chain ID. Valid chainIDs for Hedera: [0x127: mainnet, 0x128: testnet, 0x129: previewnet, 0x12a: localnet]'
    );
    return false;
  }
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
