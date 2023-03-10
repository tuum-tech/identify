import { Account, IdentitySnapState } from '../interfaces';
import { veramoImportMetaMaskAccount } from '../veramo/accountImport';
import { getCurrentCoinType, initAccountState } from './state';

/**
 * Function that returns account info of the currently selected MetaMask account.
 *
 * @param state - IdentitySnapState.
 * @returns MetaMask address and did.
 */
export async function getCurrentAccount(
  state: IdentitySnapState,
): Promise<Account> {
  try {
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
 * @param pKey - Private key(only used for Hedera accounts currently).
 */
export async function importIdentitySnapAccount(
  state: IdentitySnapState,
  evmAddress: string,
  pKey?: string,
): Promise<Account> {
  // Initialize if not there
  const coinType = (await getCurrentCoinType()).toString();
  if (!(evmAddress in state.accountState[coinType])) {
    console.log(
      `The address ${evmAddress} has NOT yet been configured. Configuring...`,
    );
    await initAccountState(snap, state, coinType, evmAddress);
  }

  // Initialize Identity Snap account
  const account: Account = await veramoImportMetaMaskAccount(
    snap,
    state,
    ethereum,
    evmAddress,
    pKey,
  );
  return account;
}
