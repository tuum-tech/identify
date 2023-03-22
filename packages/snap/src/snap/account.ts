import {
  Account,
  AccountViaPrivateKey,
  EvmAccountParams,
  ExternalAccount,
  HederaAccountParams,
  IdentitySnapState,
} from '../interfaces';
import { veramoImportMetaMaskAccount } from '../veramo/accountImport';
import { connectEVMAccount, connectHederaAccount } from './hedera';
import { getCurrentCoinType, initAccountState } from './state';

/**
 * Function that returns account info of the currently selected MetaMask account.
 *
 * @param state - IdentitySnapState.
 * @param account - External Account.
 * @returns MetaMask address and did.
 */
export async function getCurrentAccount(
  state: IdentitySnapState,
  account: ExternalAccount,
): Promise<Account> {
  try {
    if (
      account.externalAccount &&
      account.externalAccount.network === 'hedera'
    ) {
      return await connectHederaAccount(
        state,
        account.externalAccount.data as HederaAccountParams,
        true,
      );
    }

    if (account.externalAccount && account.externalAccount.network === 'evm') {
      return await connectEVMAccount(
        state,
        account.externalAccount.data as EvmAccountParams,
        true,
      );
    }

    const accounts = (await ethereum.request({
      method: 'eth_requestAccounts',
    })) as string[];
    return await importIdentitySnapAccount(state, accounts[0]);
  } catch (e) {
    console.error(`Error while trying to get the account: ${e}`);
    throw new Error(`Error while trying to get the account: ${e}`);
  }
}

/**
 * Helper function to import metamask account using the private key.
 *
 * @param state - IdentitySnapState.
 * @param evmAddress - Ethereum address.
 * @param accountViaPrivateKey - Account to import using private key.
 */
export async function importIdentitySnapAccount(
  state: IdentitySnapState,
  evmAddress: string,
  accountViaPrivateKey?: AccountViaPrivateKey,
): Promise<Account> {
  // Initialize if not there
  const coinType = (await getCurrentCoinType()).toString();

  if (evmAddress && !(evmAddress in state.accountState[coinType])) {
    console.log(
      `The address ${evmAddress} has NOT yet been configured in the Identity Snap. Configuring now...`,
    );
    await initAccountState(snap, state, coinType, evmAddress);
  }
  console.log('veramo import metamask acc');

  // Initialize Identity Snap account
  const account: Account = await veramoImportMetaMaskAccount(
    snap,
    state,
    ethereum,
    evmAddress,
    accountViaPrivateKey,
  );
  return account;
}
