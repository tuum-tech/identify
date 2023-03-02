import { MetaMaskInpageProvider } from '@metamask/providers';
import { IdentitySnapState } from '../../interfaces';
import { getCurrentNetwork } from '../../snap/network';
import { convertChainIdFromHex } from '../../utils/network';

/**
 * Function to get did pkh identifier.
 *
 * @param state - IdentitySnapState.
 * @param metamask - Metamask provider.
 */
export async function getDidPkhIdentifier(
  state: IdentitySnapState,
  metamask: MetaMaskInpageProvider,
): Promise<string> {
  const chainId = await getCurrentNetwork(metamask);
  return `eip155:${convertChainIdFromHex(chainId)}:${state.currentAccount}`;
}
