import {
  AccountId,
  Client,
  Hbar,
  PrivateKey,
  Status,
  StatusError,
  TransferTransaction,
} from '@hashgraph/sdk';

import _ from 'lodash';

import { SimpleHederaClientImpl } from './client';
import { HederaService, SimpleHederaClient } from './service';
import { WalletHedera } from './wallet/abstract';
import { PrivateKeySoftwareWallet } from './wallet/software-private-key';

export class HederaServiceImpl implements HederaService {
  async createClient(options: {
    walletHedera: WalletHedera;
    network: string;
    keyIndex: number;
    accountId: AccountId;
  }): Promise<SimpleHederaClient | null> {
    const client = Client.forNetwork(options.network as any);

    const transactionSigner = await options.walletHedera.getTransactionSigner(
      options.keyIndex,
    );
    const privateKey = await options.walletHedera.getPrivateKey(
      options.keyIndex,
    );
    const publicKey = await options.walletHedera.getPublicKey(options.keyIndex);

    if (publicKey === null) {
      return null;
    }

    // TODO: Fix
    client.setOperatorWith(
      options.accountId,
      publicKey ?? '',
      transactionSigner,
    );

    if (!(await testClientOperatorMatch(client))) {
      return null;
    }

    return new SimpleHederaClientImpl(client, privateKey);
  }
}

/**
 * Does the operator key belong to the operator account.
 *
 * @param client - Hedera Client.
 */
export async function testClientOperatorMatch(client: Client) {
  const tx = new TransferTransaction()
    /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
    .addHbarTransfer(client.operatorAccountId!, Hbar.fromTinybars(0))
    .setMaxTransactionFee(Hbar.fromTinybars(1));

  try {
    await tx.execute(client);
  } catch (err) {
    if (err instanceof StatusError) {
      if (
        err.status === Status.InsufficientTxFee ||
        err.status === Status.InsufficientPayerBalance
      ) {
        // If the transaction fails with Insufficient Tx Fee, this means
        // that the account ID verification succeeded before this point
        // Same for Insufficient Payer Balance
        return true;
      }
      return false;
    }

    console.log(
      `Error while validating private key and account id: ${JSON.stringify(
        err,
        null,
        4,
      )}`,
    );
    throw new Error(
      `Error while validating private key and account id: ${JSON.stringify(
        err,
        null,
        4,
      )}`,
    );
  }

  // under *no* cirumstances should this transaction succeed
  throw new Error(
    'unexpected success of intentionally-erroneous transaction to confirm account ID',
  );
}

/**
 * To HederaAccountInfo.
 *
 * @param _privateKey - Private Key.
 * @param _accountId - Account Id.
 * @param _network - Network.
 */
export async function isValidHederaAccountInfo(
  _privateKey: string,
  _accountId: string,
  _network: string,
): Promise<SimpleHederaClient | null> {
  const accountId = AccountId.fromString(_accountId);
  const privateKey = PrivateKey.fromStringECDSA(_privateKey);
  const walletHedera: WalletHedera = new PrivateKeySoftwareWallet(privateKey);
  const hedera = new HederaServiceImpl();

  const client = await hedera.createClient({
    walletHedera,
    keyIndex: 0,
    accountId,
    network: _network,
  });

  if (client === null || _.isEmpty(client)) {
    console.error('Invalid private key or account Id of the operator');
    return null;
  }

  return client;
}
