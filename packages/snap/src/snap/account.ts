import { BIP44CoinTypeNode } from '@metamask/key-tree';
import { MetaMaskInpageProvider } from '@metamask/providers';
import { DEFAULTCOINTYPE, HEDERACOINTYPE } from 'src/types/constants';
import {
  getAddressKeyDeriver,
  getKeysFromAddressIndex,
  snapGetKeysFromAddress,
} from 'src/utils/keyPair';
import { validHederaChainID } from '../hedera/config';
import { IdentitySnapState } from '../interfaces';
import { getCurrentNetwork } from './network';

/**
 * Function that returns address of the currently selected MetaMask account.
 *
 * @param state - IdentitySnapState.
 * @param metamask - Metamask provider.
 * @private
 * @returns MetaMask address.
 */
export async function getCurrentAccount(
  state: IdentitySnapState,
  metamask: MetaMaskInpageProvider,
): Promise<{ bip44CoinTypeNode: BIP44CoinTypeNode; account: string }> {
  try {
    const chainId = await getCurrentNetwork(metamask);
    let coinType = DEFAULTCOINTYPE;
    if (validHederaChainID(chainId)) {
      // Handle Hedera
      coinType = HEDERACOINTYPE;

      /*       if (isHederaAccountImported(state)) {
        console.log(
          `Hedera Metamask accounts: EVM Address: ${
            state.accountState[state.currentAccount].hederaAccount.evmAddress
          }, AccountId: ${
            state.accountState[state.currentAccount].hederaAccount.accountId
          }`,
        );
      } */
    }

    const bip44CoinTypeNode = await getAddressKeyDeriver(snap, coinType);
    const res = await getKeysFromAddressIndex(bip44CoinTypeNode, 0);
    if (!res) {
      console.log('Failed to get private keys from Metamask account');
      throw new Error('Failed to get private keys from Metamask account');
    }
    const privateKey = res.privateKey.split('0x')[1];
    const publicKey = res.publicKey.split('0x')[1];

    // Handle everything else
    const accounts = (await metamask.request({
      method: 'eth_requestAccounts',
    })) as string[];
    console.log(`MetaMask accounts: EVM Address: ${accounts}`);
    return accounts[0];
  } catch (e) {
    console.error(`Error while trying to get the account: ${e}`);
    return null;
  }
}
