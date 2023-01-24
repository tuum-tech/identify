import { SnapProvider } from '@metamask/snap-types';
import { IdentitySnapState } from '../../interfaces';
import { getHederaChainIDs } from '../../utils/config';
import { isHederaAccountImported } from '../../utils/params';
import { getCurrentNetwork } from '../../utils/snapUtils';

/* eslint-disable */
export async function getDidPkhIdentifier(
  wallet: SnapProvider,
  state: IdentitySnapState
): Promise<string> {
  const chain_id = await getCurrentNetwork(wallet);
  const hederaChainIDs = getHederaChainIDs();
  if (
    Array.from(hederaChainIDs.keys()).includes(chain_id) &&
    isHederaAccountImported(state)
  ) {
    // Handle Hedera
    return `hedera:${hederaChainIDs.get(chain_id)}:${
      state.accountState[state.currentAccount].hederaAccount.accountId
    }`;
  } else {
    // Handle everything else
    return `eip155:${chain_id}:${state.currentAccount}`;
  }
}
