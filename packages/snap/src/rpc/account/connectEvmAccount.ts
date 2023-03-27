import { PrivateKey } from '@hashgraph/sdk';
import { divider, heading, panel, text } from '@metamask/snaps-ui';
import { ethers, Wallet } from 'ethers';
import {
  Account,
  AccountViaPrivateKey,
  IdentitySnapState,
  SnapDialogParams,
} from '../../interfaces';
import { snapDialog } from '../../snap/dialog';
import { DEFAULTCOINTYPE } from '../../types/constants';
import { veramoImportMetaMaskAccount } from '../../veramo/accountImport';

/**
 * Connect EVM Account.
 *
 * @param state - Identity state.
 * @param evmAddress - EVM Account address.
 * @param getCompleteInfo - Whether to get the full account info or not.
 */
export async function connectEVMAccount(
  state: IdentitySnapState,
  evmAddress: string,
  getCompleteInfo?: boolean,
): Promise<Account> {
  let accountExists = false;
  for (const address of Object.keys(state.accountState[DEFAULTCOINTYPE])) {
    if (evmAddress === address) {
      accountExists = true;
      break;
    }
  }

  let privateKey: string;
  if (accountExists) {
    const controllerKeyId = `metamask-${evmAddress}`;
    privateKey =
      state.accountState[DEFAULTCOINTYPE][evmAddress].snapPrivateKeyStore[
        controllerKeyId
      ].privateKeyHex;
  } else {
    const dialogParamsForPrivateKey: SnapDialogParams = {
      type: 'Prompt',
      content: panel([
        heading('Connect to EVM Account'),
        text('Enter your ECDSA private key for the following Account'),
        divider(),
        text(`EVM Address: ${evmAddress}`),
      ]),
      placeholder: '2386d1d21644dc65d...', // You can use '2386d1d21644dc65d4e4b9e2242c5f155cab174916cbc46ad85622cdaeac835c' for testing purposes
    };
    privateKey = PrivateKey.fromString(
      (await snapDialog(snap, dialogParamsForPrivateKey)) as string,
    ).toStringRaw();
  }

  const wallet: Wallet = new ethers.Wallet(privateKey);
  const accountViaPrivateKey: AccountViaPrivateKey = {
    privateKey,
    publicKey: wallet.publicKey,
    address: wallet.address,
  };

  const account: Account = await veramoImportMetaMaskAccount(
    snap,
    state,
    ethereum,
    '',
    accountViaPrivateKey,
  );
  if (getCompleteInfo) {
    return account;
  }
  return {
    evmAddress: account.evmAddress,
    method: account.method,
    publicKey: account.publicKey,
  } as Account;
}
