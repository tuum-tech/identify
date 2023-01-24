import { SnapProvider } from '@metamask/snap-types';
import { IdentitySnapState } from '../interfaces';
import { getHederaChainIDs } from './config';
import { isHederaAccountImported } from './params';
import { getCurrentNetwork } from './snapUtils';

/* eslint-disable */
export async function switchNetworkIfNecessary(
  wallet: SnapProvider,
  state: IdentitySnapState
) {
  const hederaChainIDs = getHederaChainIDs();
  const chain_id = await getCurrentNetwork(wallet);
  if (Array.from(hederaChainIDs.keys()).includes(chain_id)) {
    if (!isHederaAccountImported(state)) {
      console.error(
        'Hedera Network was selected but Hedera Account has not yet been configured. Please configure it first by calling "configureHederaAccount" API'
      );
      throw new Error(
        'Hedera Network was selected but Hedera Account has not yet been configured. Please configure it first by calling "configureHederaAccount" API'
      );
    }
  }
}
