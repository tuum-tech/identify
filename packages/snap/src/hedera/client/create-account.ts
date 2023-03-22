import {
  AccountCreateTransaction,
  Client,
  Hbar,
  PublicKey,
} from '@hashgraph/sdk';
import { BigNumber } from 'bignumber.js';

/**
 * Create Hedera™ crypto-currency account.
 *
 * @param client - Hedera Client.
 * @param options - Create account options.
 * @param options.publicKey - Public key.
 * @param options.initialBalance - Initial balance.
 */
export async function createAccountForPublicKey(
  client: Client,
  options: {
    publicKey: PublicKey;
    initialBalance: BigNumber;
  },
): Promise<string | null> {
  const tx = new AccountCreateTransaction()
    .setInitialBalance(Hbar.fromTinybars(options.initialBalance))
    .setMaxTransactionFee(new Hbar(1))
    .setKey(options.publicKey);

  const receipt = await (await tx.execute(client)).getReceipt(client);

  const newAccountId = receipt.accountId ? receipt.accountId.toString() : '';

  if (!newAccountId) {
    console.log(
      "The transaction didn't process so a new accountId was not created",
    );
    return null;
  }

  console.log(`Account ID of the newly created account: ${newAccountId}`);

  return newAccountId;
}
