import { validHederaChainID } from '../hedera/config';
import { IdentitySnapParams } from '../interfaces';
import { getCurrentNetwork } from '../rpc/snap/utils';
import { isHederaAccountImported } from './params';

/**
 * Function to switch network if necessary.
 *
 * @param params - Identity snap params.
 */
export async function switchNetworkIfNecessary(params: IdentitySnapParams) {
  const { state, metamask } = params;
  const chainId = await getCurrentNetwork(metamask);
  if (validHederaChainID(chainId) && !isHederaAccountImported(state)) {
    console.error(
      'Hedera Network was selected but Hedera Account has not yet been configured. Please configure it first by calling "configureHederaAccount" API',
    );
    throw new Error(
      'Hedera Network was selected but Hedera Account has not yet been configured. Please configure it first by calling "configureHederaAccount" API',
    );
  }
}

export const convertChainIdFromHex = (chainId: string): string => {
  return parseInt(chainId, 16).toString();
};
