import { SnapProvider } from '@metamask/snap-types';
import { IdentitySnapState } from '../../interfaces';
import { getCurrentDid } from '../../utils/didUtils';

type HederaParams = {
  hederaAccountId: string;
};

/* eslint-disable */
export async function getDid(
  wallet: SnapProvider,
  state: IdentitySnapState,
  account: string,
  params: unknown
): Promise<string> {
  let hederaAccountId: string = '';
  if (
    params != null &&
    typeof params == 'object' &&
    'hederaAccountId' in params &&
    (params as HederaParams).hederaAccountId != null &&
    typeof (params as HederaParams).hederaAccountId === 'string'
  ) {
    hederaAccountId = (params as HederaParams).hederaAccountId;
  }
  return await getCurrentDid(wallet, state, account, hederaAccountId);
}
