import { MetaMaskInpageProvider } from '@metamask/providers';
import { validHederaChainID } from '../hedera/config';
import { IdentitySnapState } from '../interfaces';
import { isHederaAccountImported } from '../utils/params';
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
): Promise<string | null> {
  try {
    const chainId = await getCurrentNetwork(metamask);
    if (validHederaChainID(chainId)) {
      // Handle Hedera
      if (isHederaAccountImported(state)) {
        console.log(
          `Hedera Metamask accounts: EVM Address: ${
            state.accountState[state.currentAccount].hederaAccount.evmAddress
          }, AccountId: ${
            state.accountState[state.currentAccount].hederaAccount.accountId
          }`,
        );
        return state.accountState[state.currentAccount].hederaAccount
          .evmAddress;
      }

      console.error(
        'Hedera Network was selected but Hedera Account has not yet been configured. Please configure it first by calling "configureHederaAccount" API',
      );
      return null;
    }
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
