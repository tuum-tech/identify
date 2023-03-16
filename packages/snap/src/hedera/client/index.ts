import {
  AccountId,
  AccountInfoQuery,
  Client,
  Hbar,
  PrivateKey,
  PublicKey,
  TransactionReceipt,
  TransactionReceiptQuery,
  TransferTransaction,
} from '@hashgraph/sdk';
import { BigNumber } from 'bignumber.js';

import { HederaAccountInfo, SimpleHederaClient } from '../service';

import { createAccountForPublicKey } from './create-account';

export class SimpleHederaClientImpl implements SimpleHederaClient {
  private _client: Client;

  private _privateKey: PrivateKey | null;

  constructor(client: Client, privateKey: PrivateKey | null) {
    this._client = client;
    this._privateKey = privateKey;
  }

  getPrivateKey(): PrivateKey | null {
    return this._privateKey;
  }

  getPublicKey(): PublicKey {
    /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
    return this._client.operatorPublicKey!;
  }

  getAccountId(): AccountId {
    /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
    return this._client.operatorAccountId!;
  }

  async getAccountInfo(accountId: string): Promise<HederaAccountInfo> {
    // Create the account info query
    const query = new AccountInfoQuery().setAccountId(accountId);

    // Sign with client operator private key and submit the query to a Hedera network
    const accountInfo = await query.execute(this._client);

    return accountInfo as unknown as HederaAccountInfo;
  }

  createAccountForPublicKey(options: {
    publicKey: PublicKey;
    initialBalance: BigNumber;
  }): Promise<AccountId | null> {
    return createAccountForPublicKey(this._client, options);
  }

  /**
   * Create Hedera™ crypto-currency account.
   *
   * @param options - Create account options.
   * @param options.evmAddress - EVM address.
   * @param options.initialBalance - Initial balance.
   */
  async createAccountForEvmAddress(options: {
    evmAddress: string;
    initialBalance: BigNumber;
  }): Promise<AccountId | null> {
    const privateKey = this.getPrivateKey();
    if (!privateKey) {
      console.log("Private key doesn't exist for the operator");
      return null;
    }

    const transferTx: TransferTransaction = new TransferTransaction()
      .addHbarTransfer(
        this.getAccountId(),
        new Hbar(options.initialBalance).negated(),
      )
      .addHbarTransfer(options.evmAddress, options.initialBalance)
      .freezeWith(this._client);

    const transferTxSign = await transferTx.sign(privateKey);
    const transferTxSubmit = await transferTxSign.execute(this._client);

    // Get the child receipt or child record to return the Hedera Account ID for the new account that was created
    const receipt: TransactionReceipt = await new TransactionReceiptQuery()
      .setTransactionId(transferTxSubmit.transactionId)
      .setIncludeChildren(true)
      .execute(this._client);

    const newAccountId = receipt.children[0].accountId
      ? receipt.children[0].accountId.toString()
      : '';

    if (!newAccountId) {
      console.log(
        "The transaction didn't process so a new accountId was not created",
      );
      return null;
    }

    console.log(`Account ID of the newly created account: ${newAccountId}`);

    // Get the `AccountInfo` of the account
    const info = await new AccountInfoQuery()
      .setAccountId(newAccountId)
      .execute(this._client);

    if (!info.key) {
      console.log('Account info was not retrieved properly');
      return null;
    }

    console.log(
      `Account info of the new account: ${JSON.stringify(info, null, 4)}`,
    );
    return info.accountId;
  }
}
