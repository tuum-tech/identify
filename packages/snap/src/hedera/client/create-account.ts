import type { AccountId, Client, PublicKey } from '@hashgraph/sdk';
import { AccountCreateTransaction, Hbar } from '@hashgraph/sdk';
import { BigNumber } from 'bignumber.js';

/* eslint-disable */
export async function createAccount(
  client: Client,
  options: {
    publicKey: PublicKey;
    initialBalance: BigNumber;
  }
): Promise<AccountId | null> {
  const tx = new AccountCreateTransaction()
    .setInitialBalance(Hbar.fromTinybars(options.initialBalance))
    .setMaxTransactionFee(new Hbar(1))
    .setKey(options.publicKey);

  const receipt = await (await tx.execute(client)).getReceipt(client);

  return receipt.accountId;
}
