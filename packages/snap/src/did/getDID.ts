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
  const chain_id = await getCurrentNetwork(wallet);
  const result = `${method}:eip155:${chain_id}:${account}`;
  console.log('DID: ', result);
  return result;
}
