import {
  AccountId,
  AccountInfoQuery,
  Client,
  PrivateKey,
  PublicKey,
} from '@hashgraph/sdk';

import { ethers } from 'ethers';
import { IdentitySnapState } from '../interfaces';

/* eslint-disable */
/*
This function is used to generate account ID from public key. It'll return the accountID 
with a non-null aliasKey member with the form 
0.0.302a300506032b6570032100114e6abc371b82dab5c15ea149f02d34a012087b163516dd70f44acafabf7777
Note the prefix of "0.0" indicating the shard and realm
This is especially useful when the account has no HBAR because an account with some HBAR 
takes the form of 0.0.123
*/
export async function recoveredPublicKeyToAccountId(
  state: IdentitySnapState,
  account: string
): Promise<AccountId> {
  const compressed = ethers.utils.computePublicKey(
    ethers.utils.arrayify(state.accountState[account].publicKey),
    true
  );

  return PublicKey.fromString(compressed).toAccountId(0, 0);
}

/* export async function transferHbarsToAccount(
  operatorId: any,
  operatorPrivateKey: any,
  amount: any,
  accountId: AccountId
): Promise<any> {
  client.setOperator(operatorId, operatorPrivateKey);

  const transferTransaction = await new TransferTransaction()
    .addHbarTransfer(client.operatorAccountId, new Hbar(amount).negated())
    .addHbarTransfer(accountId, new Hbar(amount))
    .execute(client);

  return transferTransaction.getReceipt(client);
} */

/*
This function is used to generate account ID from the EVM address. It'll return the accountID 
with a null aliasKey member with the form 
0.0.123
Note the prefix of "0.0" indicating the shard and realm

 return new AccountInfoQuery({
    accountId: AccountId.fromEvmAddress(0, 0, evmAddress),
  }).execute(client);
*/
/* export async function getAccountInfo(
  state: IdentitySnapState,
  account: string
): Promise<string> {
  const publicKey = PublicKey.fromString(state.accountState[account].publicKey);
  const privateKey = PrivateKey.fromString(
    state.accountState[account].privateKey
  );
  const aliasAccountId = publicKey.toAccountId(0, 0);
  const hederaWallet = new Wallet(aliasAccountId, privateKey);

  const info = await new AccountInfoQuery()
    .setAccountId(aliasAccountId)
    .executeWithSigner(hederaWallet);
  return info.toString();
} */

export async function getAccountInfo(account: string): Promise<String> {
  // Operator account ID and private key from string value
  const OPERATOR_ID = AccountId.fromString('0.0.48865029');
  const OPERATOR_KEY = PrivateKey.fromString(
    '2386d1d21644dc65d4e4b9e2242c5f155cab174916cbc46ad85622cdaeac835c'
  );

  // Pre-configured client for test network (testnet)
  // TODO: Configure client based on whether it's a testnet, previewnet or mainnet
  const client = Client.forTestnet();

  //Set the operator with the operator ID and operator key
  client.setOperator(OPERATOR_ID, OPERATOR_KEY);

  console.log('client: ', JSON.stringify(client, null, 4));

  const info = await new AccountInfoQuery({
    accountId: AccountId.fromEvmAddress(0, 0, account),
  }).execute(client);
  console.log('info: ', info);

  if (info.accountId) return info.accountId.toString();
  else return '';
}
