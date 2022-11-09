import { SnapProvider } from '@metamask/snap-types';
import { IdentitySnapState } from '../interfaces';
import { getCurrentNetwork } from '../utils/snapUtils';

/* eslint-disable */
/**
 * Retrieve the current DID of the user
 * @param wallet wallet
 * @param state state
 * @param account account
 * @returns DID
 */
export async function getDid(
  wallet: SnapProvider,
  state: IdentitySnapState,
  account: string
): Promise<string> {
  const method = 'did:pkh';
  console.log('Current method', method);
  const chain_id = await getCurrentNetwork(wallet);
  return `did:pkh:eip155:${chain_id}:${account}`;
}
