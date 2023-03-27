import { PrivateKey } from '@hashgraph/sdk';
import { divider, heading, panel, text } from '@metamask/snaps-ui';
import { ethers, Wallet } from 'ethers';
import _ from 'lodash';
import { validHederaChainID } from '../../hedera/config';
import {
  Account,
  AccountViaPrivateKey,
  IdentitySnapState,
  SnapDialogParams,
} from '../../interfaces';
import { snapDialog } from '../../snap/dialog';
import { getCurrentNetwork } from '../../snap/network';
import { HEDERACOINTYPE } from '../../types/constants';
import { getHederaAccountIfExists } from '../../utils/params';
import { veramoImportMetaMaskAccount } from '../../veramo/accountImport';

/**
 * Connect Hedera Account.
 *
 * @param state - Identity state.
 * @param accountId - Account id.
 * @param getCompleteInfo - Whether to get the full account info or not.
 */
export async function connectHederaAccount(
  state: IdentitySnapState,
  accountId: string,
  getCompleteInfo?: boolean,
): Promise<Account> {
  const chainId = await getCurrentNetwork(ethereum);
  if (!validHederaChainID(chainId)) {
    console.error(
      'Invalid Chain ID. Valid chainIDs for Hedera: [0x127: mainnet, 0x128: testnet, 0x129: previewnet]',
    );
    throw new Error(
      'Non-Hedera network was selected on Metamask while trying to configure the Hedera network. Please switch the network to Hedera Network first',
    );
  }

  let privateKey: string;
  const evmAddress = await getHederaAccountIfExists(
    state,
    accountId,
    undefined,
  );
  if (evmAddress === null || _.isEmpty(evmAddress)) {
    const dialogParamsForPrivateKey: SnapDialogParams = {
      type: 'Prompt',
      content: panel([
        heading('Connect to Hedera Account'),
        text('Enter your ECDSA private key for the following Account'),
        divider(),
        text(`Account Id: ${accountId}`),
      ]),
      placeholder: '2386d1d21644dc65d...', // You can use '2386d1d21644dc65d4e4b9e2242c5f155cab174916cbc46ad85622cdaeac835c' and '0.0.15215' for testing purposes
    };
    privateKey = PrivateKey.fromString(
      (await snapDialog(snap, dialogParamsForPrivateKey)) as string,
    ).toStringRaw();
  } else {
    const controllerKeyId = `metamask-${evmAddress}`;
    privateKey =
      state.accountState[HEDERACOINTYPE][evmAddress].snapPrivateKeyStore[
        controllerKeyId
      ].privateKeyHex;
  }

  const wallet: Wallet = new ethers.Wallet(privateKey);
  const accountViaPrivateKey: AccountViaPrivateKey = {
    privateKey,
    publicKey: wallet.publicKey,
    address: wallet.address,
    extraData: accountId,
  };

  const account: Account = await veramoImportMetaMaskAccount(
    snap,
    state,
    ethereum,
    '',
    accountViaPrivateKey,
  );
  account.extraData = {
    accountId,
  };

  if (getCompleteInfo) {
    return account;
  }
  return {
    evmAddress: account.evmAddress,
    method: account.method,
    publicKey: account.publicKey,
    extraData: {
      accountId,
    },
  } as Account;
}
