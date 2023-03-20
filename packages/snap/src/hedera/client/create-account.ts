import {
  AccountCreateTransaction,
  Client,
  Hbar,
  PublicKey,
  TransactionReceipt,
} from '@hashgraph/sdk';
import { BigNumber } from 'bignumber.js';
import { HederaServiceImpl } from '..';
import { getCurrentNetwork } from '../../snap/network';
import { getHederaNetwork } from '../config';
import { HederaMirrorInfo } from '../service';

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
): Promise<HederaMirrorInfo | null> {
  const tx = new AccountCreateTransaction()
    .setInitialBalance(Hbar.fromTinybars(options.initialBalance))
    .setMaxTransactionFee(new Hbar(1))
    .setKey(options.publicKey);

  const receipt: TransactionReceipt = await (
    await tx.execute(client)
  ).getReceipt(client);

  const newAccountId = receipt.accountId ? receipt.accountId.toString() : '';

  console.log('newAccountId: ', newAccountId);

  if (!newAccountId) {
    console.log(
      "The transaction didn't process successfully so a new accountId was not created",
    );
    return null;
  }

  try {
    const hederaService = new HederaServiceImpl(
      getHederaNetwork(await getCurrentNetwork(ethereum)),
    );
    return (await hederaService.getAccountFromPublicKey(
      options.publicKey.toStringRaw(),
    )) as HederaMirrorInfo;
  } catch (error) {
    console.log(
      'Error while retrieving account info using public key: ',
      error,
    );
    return null;
  }
}
