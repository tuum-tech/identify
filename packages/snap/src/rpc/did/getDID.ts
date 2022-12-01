import { SnapProvider } from '@metamask/snap-types';
import { IdentitySnapState } from '../../interfaces';
import { getCurrentDid } from '../../utils/didUtils';

/* eslint-disable */
export async function getDid(
  wallet: SnapProvider,
  state: IdentitySnapState
): Promise<string> {
  return await getCurrentDid(wallet, state);
}
