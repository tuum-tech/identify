import { Account, IdentitySnapState } from '../interfaces';
import { connectHederaAccount } from '../rpc/account/connectHederaAccount';
import { veramoImportMetaMaskAccount } from '../veramo/accountImport';
import { getCurrentCoinType, initAccountState } from './state';

/**
 * Function that returns account info of the currently selected MetaMask account.
 *
 * @param state - IdentitySnapState.
 * @param hederaAccountId - Hedera Identifier.
 * @returns MetaMask address and did.
 */
export async function getCurrentAccount(
  state: IdentitySnapState,
  hederaAccountId?: string,
): Promise<Account> {
  try {
    if (hederaAccountId) {
      return await connectHederaAccount(state, hederaAccountId, true);
    }
    const accounts = (await ethereum.request({
      method: 'eth_requestAccounts',
    })) as string[];
    const address = accounts[0];
    // Initialize if not there
    const coinType = (await getCurrentCoinType()).toString();
    if (address && !(address in state.accountState[coinType])) {
      console.log(
        `The address ${address} has NOT yet been configured in the Identity Snap. Configuring now...`,
      );
      await initAccountState(snap, state, coinType, address);
    }
    return await veramoImportMetaMaskAccount(snap, state, ethereum, address);
  } catch (e) {
    console.error(`Error while trying to get the account: ${e}`);
    throw new Error(`Error while trying to get the account: ${e}`);
  }
}
