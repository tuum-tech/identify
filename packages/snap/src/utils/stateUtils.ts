import { SnapProvider } from '@metamask/snap-types';
import { IdentitySnapState } from '../interfaces';
import { getEmptyAccountState, getInitialSnapState } from './config';
import { getPublicKey } from './snapUtils';

/* eslint-disable */
/**
 * Function for updating IdentitySnapState object in the MetaMask state
 *
 * @public
 *
 * @param {IdentitySnapState} snapState - object to replace the current object in the MetaMask state.
 *
 * @beta
 *
 **/
export async function updateSnapState(
  wallet: SnapProvider,
  snapState: IdentitySnapState
) {
  await wallet.request({
    method: 'snap_manageState',
    params: ['update', snapState],
  });
}

/**
 * Function to retrieve IdentitySnapState object from the MetaMask state
 *
 * @public
 *
 * @returns {Promise<IdentitySnapState>} object from the state
 *
 * @beta
 *
 **/
export async function getSnapStateUnchecked(
  wallet: SnapProvider
): Promise<IdentitySnapState | null> {
  return (await wallet.request({
    method: 'snap_manageState',
    params: ['get'],
  })) as IdentitySnapState | null;
}

/**
 * Function to initialize IdentitySnapState object
 *
 * @public
 *
 * @returns {Promise<IdentitySnapState>} object
 *
 * @beta
 *
 **/
export async function initSnapState(
  wallet: SnapProvider
): Promise<IdentitySnapState> {
  const state = getInitialSnapState();
  await updateSnapState(wallet, state);
  return state;
}

/**
 * Function that creates an empty IdentitySnapState object in the Identity Snap state for the provided address.
 *
 * @public
 *
 * @param {IdentitySnapState} state - IdentitySnapState
 * @param {string} account - MetaMask account
 *
 * @beta
 *
 **/
export async function initAccountState(
  wallet: SnapProvider,
  state: IdentitySnapState,
  account: string
): Promise<void> {
  state.accountState[account] = getEmptyAccountState();
  // FIXME: How to handle if user declines signature ?
  /* TODO: Uncomment this when snap issue of permission with snap_getBip44Entropy is resolved
  const privateKey = await getPrivateKey(wallet);
  state.accountState[account].privateKey = privateKey;
  */
  // TODO: Modify this to test locally by passing in a hardcoded private key of your metamask wallet
  state.accountState[account].privateKey =
    '2386d1d21644dc65d4e4b9e2242c5f155cab174916cbc46ad85622cdaeac835c';
  const publicKey = await getPublicKey(wallet, state, account);
  state.accountState[account].publicKey = publicKey;
  await updateSnapState(wallet, state);
}
