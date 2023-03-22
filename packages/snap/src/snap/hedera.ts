import { PrivateKey } from '@hashgraph/sdk';
import { heading, panel, text } from '@metamask/snaps-ui';
import { ethers, Wallet } from 'ethers';
import { validEVMChainID, validHederaChainID } from '../hedera/config';
import {
  Account,
  AccountViaPrivateKey,
  EvmAccountParams,
  HederaAccountParams,
  IdentitySnapState,
  SnapDialogParams,
} from '../interfaces';
import { HEDERACOINTYPE } from '../types/constants';
import { getHederaAccountIfExists } from '../utils/params';
import { importIdentitySnapAccount } from './account';
import { snapDialog } from './dialog';
import { getCurrentNetwork } from './network';

/**
 * Connect Hedera Account.
 *
 * @param state - Identity state.
 * @param hederaAccount - Hedera Account Params.
 * @param getCompleteInfo - Whether to get the full account info or not.
 */
export async function connectHederaAccount(
  state: IdentitySnapState,
  hederaAccount: HederaAccountParams,
  getCompleteInfo?: boolean,
): Promise<Account> {
  const chainId = await getCurrentNetwork(ethereum);
  const { accountId } = hederaAccount;

  console.log(chainId);
  if (validHederaChainID(chainId)) {
    let privateKey: string;
    const evmAddress = await getHederaAccountIfExists(
      state,
      accountId,
      undefined,
    );
    if (evmAddress === '') {
      const dialogParamsForPrivateKey: SnapDialogParams = {
        type: 'Prompt',
        content: panel([
          heading('Connect to Hedera Account'),
          text('Enter your ECDSA private key for your Hedera Account'),
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

    const account = await importIdentitySnapAccount(
      state,
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

  console.error(
    'Invalid Chain ID. Valid chainIDs for Hedera: [0x127: mainnet, 0x128: testnet, 0x129: previewnet, 0x12a: localnet]',
  );
  throw new Error(
    'Non-Hedera network was selected on Metamask while trying to configure the Hedera network. Please switch the network to Hedera Network first',
  );
}

/**
 * Connect Hedera Account.
 *
 * @param state - Identity state.
 * @param evmAccount - EVM Account Params.
 * @param getCompleteInfo - Whether to get the full account info or not.
 */
export async function connectEVMAccount(
  state: IdentitySnapState,
  evmAccount: EvmAccountParams,
  getCompleteInfo?: boolean,
): Promise<Account> {
  const chainId = await getCurrentNetwork(ethereum);

  if (validEVMChainID(chainId)) {
    const dialogParamsForPrivateKey: SnapDialogParams = {
      type: 'Prompt',
      content: panel([
        heading('Connect to EVM Account'),
        text('Enter your ECDSA private key for your EVM Account'),
      ]),
      placeholder: '787278d71bc9b50e8147...', // You can use 'd787278d71bc9b50e814705ca48fcf652e08fb5eb73773e98146c48846bde456'
    };
    const privateKey: string = (await snapDialog(
      snap,
      dialogParamsForPrivateKey,
    )) as string;

    // const wallet: Wallet = new ethers.Wallet(privateKey);
    const accountViaPrivateKey: AccountViaPrivateKey = {
      privateKey,
      publicKey: '',
      address: evmAccount.address,
    };

    const account = await importIdentitySnapAccount(
      state,
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

  console.error(
    'Invalid Chain ID. Valid chainIDs for EVM account: [137: polygon]',
  );
  throw new Error(
    'Invalid Chain ID. Valid chainIDs for EVM account: [137: polygon]',
  );
}
