import { SnapsGlobalObject } from '@metamask/snaps-types';
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
  snap: SnapsGlobalObject,
  snapState: IdentitySnapState
) {
  await snap.request({
    method: 'snap_manageState',
    params: { operation: 'update', newState: snapState },
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
  snap: SnapsGlobalObject
): Promise<IdentitySnapState> {
  const state = (await snap.request({
    method: 'snap_manageState',
    params: { operation: 'get' },
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
  snap: SnapsGlobalObject
): Promise<IdentitySnapState | null> {
  return (await snap.request({
    method: 'snap_manageState',
    params: { operation: 'get' },
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
  snap: SnapsGlobalObject
): Promise<IdentitySnapState> {
  const state = getInitialSnapState();
  await updateSnapState(snap, state);
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
  snap: SnapsGlobalObject,
  state: IdentitySnapState,
  currentAccount: string
): Promise<void> {
  state.accountState[currentAccount] = getEmptyAccountState();
  await updateSnapState(snap, state);
}
