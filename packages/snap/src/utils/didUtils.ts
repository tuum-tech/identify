import { SnapProvider } from '@metamask/snap-types';
import { IdentitySnapState } from '../interfaces';
import { getHederaChainIDs } from './config';
import { getCurrentNetwork } from './snapUtils';

/* eslint-disable */
export async function getCurrentDid(
  wallet: SnapProvider,
  state: IdentitySnapState,
  account: string
): Promise<string> {
  const method = state.accountState[account].accountConfig.identity.didMethod;

  let result = ``;
  // Chain Id of Ethereum = 0x1
  // For Hedera, the local and previewnet are 0x12a (298)
  // Previewnet = 0x129 (297); Testnet = 0x128 (296); Mainnet = 0x127 (295)
  const chain_id = await getCurrentNetwork(wallet);
  const hederaChainIDs = getHederaChainIDs();
  if (Array.from(hederaChainIDs.keys()).includes(chain_id)) {
    result = `${method}:hedera:${hederaChainIDs.get(chain_id)}:${
      state.hederaAccount.accountId
    }`;
  } else {
    result = `${method}:eip155:${chain_id}:${account}`;
  }
  return result;
}
