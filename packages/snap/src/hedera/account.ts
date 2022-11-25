import {
  getBIP44AddressKeyDeriver,
  JsonBIP44CoinTypeNode,
} from '@metamask/key-tree';
import { SnapProvider } from '@metamask/snap-types';
import { getMetamaskVersion, isNewerVersion } from '../utils/version';

/**
 * Return derived KeyPair from seed.
 * @param wallet
 */
export async function getPrivateKey(wallet: SnapProvider): Promise<string> {
  console.log('wallet: ', wallet);
  const bip44Code = 3030;
  const currentVersion = await getMetamaskVersion(wallet);
  let hbarNode: JsonBIP44CoinTypeNode;
  // coin_type 3030 = HBAR. Refer to https://github.com/satoshilabs/slips/blob/master/slip-0044.md
  if (isNewerVersion('MetaMask/v10.18.99-flask.0', currentVersion))
    hbarNode = (await wallet.request({
      method: 'snap_getBip44Entropy',
      params: {
        coinType: Number(bip44Code),
      },
    })) as JsonBIP44CoinTypeNode;
  else
    hbarNode = (await wallet.request({
      method: `snap_getBip44Entropy_${bip44Code}`,
      params: [],
    })) as JsonBIP44CoinTypeNode;
  console.log('hbarNode: ', hbarNode);

  // Next, we'll create an address key deriver function for the Dogecoin coin_type node.
  // In this case, its path will be: m / 44' / 3030' / 0' / 0 / address_index
  const deriveHbarAddress = await getBIP44AddressKeyDeriver(hbarNode);
  console.log('deriveHbarAddress:', deriveHbarAddress);

  // These are BIP-44 nodes containing the extended private keys for
  // the respective derivation paths.

  // A complete BIP-44 HD tree path consists of the following nodes:
  // m / 44 / coin_type / account' / change / address_index
  // m / 44' / 3030' / 0' / 0 / 0
  const addressKey0 = await deriveHbarAddress(0);
  console.log('addressKey0:', addressKey0);
  if (addressKey0.privateKey) {
    console.log('addressKey0.privateKey:', addressKey0.privateKey);
    return addressKey0.privateKey;
  } else return '';
}
