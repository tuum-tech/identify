import { SnapProvider } from '@metamask/snap-types';
import { getHederaNetwork, validHederaChainID } from '../../hedera/config';
import { IdentitySnapState } from '../../interfaces';
import { convertChainIdFromHex } from '../../utils/network';
import { isHederaAccountImported } from '../../utils/params';
import { getCurrentNetwork } from '../../utils/snapUtils';

/* eslint-disable */
export async function getDidPkhIdentifier(
  wallet: SnapProvider,
  state: IdentitySnapState
): Promise<string> {
  const chainId = await getCurrentNetwork(wallet);
  if (validHederaChainID(chainId) && isHederaAccountImported(state)) {
    // Handle Hedera
    return `hedera:${getHederaNetwork(chainId)}:${state.currentAccount}`;
  } else {
    // Handle everything else
    return `eip155:${convertChainIdFromHex(chainId)}:${state.currentAccount}`;
  }
}
