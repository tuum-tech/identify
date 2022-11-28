import { AccountId, Client, PrivateKey, PublicKey } from '@hashgraph/sdk';
import { BigNumber } from 'bignumber.js';

import { SimpleHederaClient } from '../service';

import { createAccount } from './create-account';

/* eslint-disable */
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

  createAccount(options: {
    publicKey: PublicKey;
    initialBalance: BigNumber;
  }): Promise<AccountId | null> {
    return createAccount(this._client, options);
  }
}
