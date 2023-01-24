import { SnapProvider } from '@metamask/snap-types';
import { IdentitySnapState } from '../interfaces';
import { getEmptyAccountState, getInitialSnapState } from './config';

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
export async function getSnapState(
  wallet: SnapProvider
): Promise<IdentitySnapState> {
  const state = (await wallet.request({
    method: 'snap_manageState',
    params: ['get'],
  })) as IdentitySnapState | null;

  if (!state) throw Error('IdentitySnapState is not initialized!');
  return state;
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
  currentAccount: string
): Promise<void> {
  state.accountState[currentAccount] = getEmptyAccountState();
  await updateSnapState(wallet, state);
}
