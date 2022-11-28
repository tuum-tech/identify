import { PublicKey } from '@hashgraph/sdk';
import { SnapProvider } from '@metamask/snap-types';
import { ethers } from 'ethers';
import { HederaServiceImpl } from '../hedera';
import { WalletHedera } from '../hedera/wallet/abstract';
import { PrivateKeySoftwareWallet } from '../hedera/wallet/software-private-key';
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
  account: string,
  hederaAccountId: string = ''
): Promise<string> {
  const method = state.accountState[account].accountConfig.identity.didMethod;

  let result = ``;
  // Chain Id of Ethereum = 0x1
  // For Hedera, the local and previewnet are 0x12a (298)
  // Previewnet = 0x129 (297); Testnet = 0x128 (296); Mainnet = 0x127 (295)
  const chain_id = await getCurrentNetwork(wallet);
  if (Array.from(HEDERA_CHAINID.keys()).includes(chain_id)) {
    const { PrivateKey, AccountId } = await import('@hashgraph/sdk');

    const accountId = AccountId.fromString(hederaAccountId);
    const key = PrivateKey.fromStringECDSA(
      state.accountState[account].privateKey
    );
    const walletHedera: WalletHedera = new PrivateKeySoftwareWallet(key);
    const hedera = new HederaServiceImpl();

    const client = await hedera.createClient({
      walletHedera,
      keyIndex: 0,
      accountId: accountId,
      network: HEDERA_CHAINID.get(chain_id) as string,
    });
    if (client != null) {
      result = `${method}:hedera:${HEDERA_CHAINID.get(
        chain_id
      )}:${client.getAccountId()}`;
    } else {
      const compressed = ethers.utils.computePublicKey(
        ethers.utils.arrayify(state.accountState[account].publicKey),
        true
      );
      const accountId = PublicKey.fromString(compressed).toAccountId(0, 0);
      result = `${method}:hedera:${HEDERA_CHAINID.get(chain_id)}:${accountId}`;
    }
  } else {
    result = `${method}:eip155:${chain_id}:${account}`;
  }
  return result;
}
