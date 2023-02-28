import { SnapsGlobalObject } from '@metamask/snaps-types';
import { IdentitySnapState } from '../interfaces';
import { getEmptyAccountState, getInitialSnapState } from '../utils/config';

/**
 * Function for updating IdentitySnapState object in the MetaMask state.
 *
 * @public
 * @param snap - Snap.
 * @param snapState - Object to replace the current object in the MetaMask state.
 */
export async function updateSnapState(
  snap: SnapsGlobalObject,
  snapState: IdentitySnapState,
) {
  await snap.request({
    method: 'snap_manageState',
    params: { operation: 'update', newState: snapState },
  });
}

/**
 * Function to retrieve IdentitySnapState object from the MetaMask state.
 *
 * @param snap - Snap.
 * @public
 * @returns Object from the state.
 */
export async function getSnapState(
  snap: SnapsGlobalObject,
): Promise<IdentitySnapState> {
  const state = (await snap.request({
    method: 'snap_manageState',
    params: { operation: 'get' },
  })) as IdentitySnapState | null;

  if (!state) {
    throw Error('IdentitySnapState is not initialized!');
  }
  return state;
}

/**
 * Function to retrieve IdentitySnapState object from the MetaMask state.
 *
 * @param snap - Snap.
 * @public
 * @returns Object from the state.
 */
export async function getSnapStateUnchecked(
  snap: SnapsGlobalObject,
): Promise<IdentitySnapState | null> {
  return (await snap.request({
    method: 'snap_manageState',
    params: { operation: 'get' },
  })) as IdentitySnapState | null;
}

/**
 * Function to initialize IdentitySnapState object.
 *
 * @param snap - Snap.
 * @public
 * @returns Object.
 */
export async function initSnapState(
  snap: SnapsGlobalObject,
): Promise<IdentitySnapState> {
  const state = getInitialSnapState();
  await updateSnapState(snap, state);
  return state;
}

/**
 * Function that creates an empty IdentitySnapState object in the Identity Snap state for the provided address.
 *
 * @public
 * @param snap - Snap.
 * @param state - IdentitySnapState.
 * @param currentAccount - Current account.
 */
export async function initAccountState(
  snap: SnapsGlobalObject,
  state: IdentitySnapState,
  currentAccount: string,
): Promise<void> {
  state.accountState[currentAccount] = getEmptyAccountState();
  await updateSnapState(snap, state);
}
