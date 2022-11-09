import { SnapProvider } from '@metamask/snap-types';
import { IdentitySnapState } from '../interfaces';
import { getCurrentNetwork } from './snapUtils';

/* eslint-disable */
export async function getCurrentDid(
  wallet: SnapProvider,
  state: IdentitySnapState,
  account: string
): Promise<string> {
  const method = state.accountState[account].accountConfig.identity.didMethod;
  const chain_id = await getCurrentNetwork(wallet);
  const result = `${method}:eip155:${chain_id}:${account}`;
  return result;
}
