/* import {
  getBIP44AddressKeyDeriver,
  JsonBIP44CoinTypeNode,
} from '@metamask/key-tree';
import { SnapProvider } from '@metamask/snap-types';

/**
 * Return derived KeyPair from seed.
 * @param wallet
 */
/*
export async function getPrivateKey(wallet: SnapProvider): Promise<string> {
  // coin_type 3030 = HBAR. Refer to https://github.com/satoshilabs/slips/blob/master/slip-0044.md
  let bip44Node: JsonBIP44CoinTypeNode = (await wallet.request({
    method: 'snap_getBip44Entropy',
    params: {
      coinType: 3030,
    },
  })) as JsonBIP44CoinTypeNode;

  // Next, we'll create an address key deriver function for the Dogecoin coin_type node.
  // In this case, its path will be: m / 44' / 3' / 0' / 0 / address_index
  const deriveHbarAddress = await getBIP44AddressKeyDeriver(bip44Node);

  // These are BIP-44 nodes containing the extended private keys for
  // the respective derivation paths.

  // m / 44' / 3' / 0' / 0 / 0
  const addressKey0 = await deriveHbarAddress(0);
  if (addressKey0.privateKey) return addressKey0.privateKey;
  else return '';
}
 */
