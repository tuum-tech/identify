import { AccountId, Client } from '@hashgraph/sdk';

import { HederaService, SimpleHederaClient } from './service';
import { WalletHedera } from './wallet/abstract';

import { SimpleHederaClientImpl } from './client';

/* eslint-disable */
export class HederaServiceImpl implements HederaService {
  async createClient(options: {
    walletHedera: WalletHedera;
    network: string;
    keyIndex: number;
    accountId: AccountId;
  }): Promise<SimpleHederaClient | null> {
    const { Client } = await import('@hashgraph/sdk');

    const client = Client.forNetwork(options.network as any);
    const transactionSigner = await options.walletHedera.getTransactionSigner(
      options.keyIndex
    );
    const privateKey = await options.walletHedera.getPrivateKey(
      options.keyIndex
    );
    const publicKey = await options.walletHedera.getPublicKey(options.keyIndex);

    // TODO: Fix
    client.setOperatorWith(
      options.accountId,
      publicKey ?? '',
      transactionSigner
    );

    if (!(await testClientOperatorMatch(client))) {
      return null;
    }

    return new SimpleHederaClientImpl(client, privateKey);
  }
}

/** Does the operator key belong to the operator account */
export async function testClientOperatorMatch(client: Client) {
  const { TransferTransaction, Hbar, Status, StatusError } = await import(
    '@hashgraph/sdk'
  );

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
      console.error(`Error: ${err}`);
      return false;
    }

    throw err;
  }

  // under *no* cirumstances should this transaction succeed
  throw new Error(
    'unexpected success of intentionally-erroneous transaction to confirm account ID'
  );
}
