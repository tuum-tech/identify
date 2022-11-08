import { SnapProvider } from '@metamask/snap-types';
import { IdentitySnapState } from '../interfaces';
import { getCurrentNetwork } from '../utils/snapUtils';

export async function getDid(
  wallet: SnapProvider,
  state: IdentitySnapState,
  account: string,
): Promise<string> {
  const method = 'did:pkh';
  console.log('Current method', method);
  const chain_id = await getCurrentNetwork(wallet);
  return `did:pkh:eip155:${chain_id}:${account}`;
}
