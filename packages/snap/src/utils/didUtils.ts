import { SnapProvider } from '@metamask/snap-types';
import { getAccountId } from '../hedera/hederaSdk';
import { IdentitySnapState } from '../interfaces';
import { getCurrentNetwork } from './snapUtils';

const HEDERA_CHAINID = new Map([
  ['0x127', 'mainnet'],
  ['0x128', 'testnet'],
  ['0x129', 'previewnet'],
  ['0x12a', 'localnet'],
]);

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
  if (Array.from(HEDERA_CHAINID.keys()).includes(chain_id)) {
    const accountId = await getAccountId(state, account);
    result = `${method}:hedera:${HEDERA_CHAINID.get(chain_id)}:${accountId}`;
  } else {
    result = `${method}:eip155:${chain_id}:${account}`;
  }
  return result;
}
