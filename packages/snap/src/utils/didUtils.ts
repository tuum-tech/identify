import { SnapProvider } from '@metamask/snap-types';
import { IdentitySnapState } from '../interfaces';
import { getHederaChainIDs } from './config';
import { isHederaAccountImported } from './params';
import { getCurrentNetwork } from './snapUtils';

/* eslint-disable */
export async function getCurrentDid(
  wallet: SnapProvider,
  state: IdentitySnapState
): Promise<string> {
  let did: string = '';
  const method =
    state.accountState[state.currentAccount].accountConfig.identity.didMethod;
  const chain_id = await getCurrentNetwork(wallet);
  const hederaChainIDs = getHederaChainIDs();

  if (method === 'did:pkh') {
    if (
      Array.from(hederaChainIDs.keys()).includes(chain_id) &&
      isHederaAccountImported(state)
    ) {
      // Handle Hedera
      did = `${method}:hedera:${hederaChainIDs.get(chain_id)}:${state.hederaAccount.accountId}`;
    } else {
      // Handle everything else
      did = `${method}:eip155:${chain_id}:${state.currentAccount}`;
    }
  } else {
    console.error(
      'did method not supported. Supported methods are: ["did:pkh"]'
    );
    throw new Error(
      'did method not supported. Supported methods are: ["did:pkh"]'
    );
  }
  return did;
}
