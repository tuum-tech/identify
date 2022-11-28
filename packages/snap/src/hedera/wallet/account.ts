import {
  getBIP44AddressKeyDeriver,
  JsonBIP44CoinTypeNode,
} from '@metamask/key-tree';
import { SnapProvider } from '@metamask/snap-types';
import { ethers } from 'ethers';
import { IdentitySnapState } from '../../interfaces';
import { getMetamaskVersion, isNewerVersion } from '../../utils/version';

/* eslint-disable */
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

/*
This function is used to generate account ID from the EVM address. It'll return the accountID 
with a null aliasKey member with the form 
0.0.123
Note the prefix of "0.0" indicating the shard and realm
*/
export async function getAccountId(
  state: IdentitySnapState,
  account: string
): Promise<string> {
  const compressedKey = ethers.utils.computePublicKey(
    ethers.utils.arrayify(state.accountState[account].publicKey),
    true
  );

  async function mirrorQuery(url: RequestInfo | URL) {
    let response = await fetch(url);
    let info = await response.json();
    return info;
  }
  // Returns all account information for the given public key
  const accountInfoUrl = `https://testnet.mirrornode.hedera.com/api/v1/accounts?account.publickey=${compressedKey}`;
  let accountInfoResult = await mirrorQuery(accountInfoUrl);

  let accountId: string = '';
  // This Hbar account needs some HBAR to be activated on the ledger
  if (
    accountInfoResult.hasOwnProperty('accounts') &&
    accountInfoResult.accounts.length > 0
  ) {
    for (let i = 0; i < accountInfoResult.accounts.length; i++) {
      const result = accountInfoResult.accounts[i];
      if (result.evm_address === account) {
        accountId = result.account;
        break;
      }
    }
  } else {
    // This Hbar account is not activated on the ledger yet. Need to send some HBAR to this account to activate it first
    // TODO: Transfer HBAR to this account then get account info: https://github.com/hashgraph/hedera-sdk-js/blob/develop/examples/account-alias.js
  }
  return accountId;
}
