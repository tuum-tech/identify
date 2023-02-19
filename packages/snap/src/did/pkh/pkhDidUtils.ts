import { MetaMaskInpageProvider } from '@metamask/providers';
import { validHederaChainID } from '../../hedera/config';
import { IdentitySnapState } from '../../interfaces';
import { convertChainIdFromHex } from '../../utils/network';
import { isHederaAccountImported } from '../../utils/params';
import { getCurrentNetwork } from '../../utils/snapUtils';

/* eslint-disable */
export async function getDidPkhIdentifier(
  state: IdentitySnapState,
  metamask: MetaMaskInpageProvider
): Promise<string> {
  const chainId = await getCurrentNetwork(metamask);
  if (validHederaChainID(chainId) && isHederaAccountImported(state)) {
    // Handle Hedera
    // TODO: Uncomment the below line once CAIP2 supports this did format for hedera
    // return `hedera:${getHederaNetwork(chainId)}:${state.currentAccount}`;
    return `eip155:${convertChainIdFromHex(chainId)}:${state.currentAccount}`;
  } else {
    // Handle everything else
    return `eip155:${convertChainIdFromHex(chainId)}:${state.currentAccount}`;
  }
}
