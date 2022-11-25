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

/* export async function transferHbarsToAccount(
  operatorId: any,
  operatorPrivateKey: any,
  amount: any,
  accountId: AccountId
): Promise<any> {
  client.setOperator(operatorId, operatorPrivateKey);

  console.log("Transferring some Hbar to the new account");
    let transaction = await new TransferTransaction()
        .addHbarTransfer(wallet.getAccountId(), new Hbar(10).negated())
        .addHbarTransfer(aliasAccountId, new Hbar(10))
        .freezeWithSigner(wallet);
    transaction = await transaction.signWithSigner(wallet);

    const response = await transaction.executeWithSigner(wallet);
    await response.getReceiptWithSigner(wallet);

    const balance = await new AccountBalanceQuery()
        .setNodeAccountIds([response.nodeId])
        .setAccountId(aliasAccountId)
        .executeWithSigner(wallet);

    console.log(`Balances of the new account: ${balance.toString()}`);

    const info = await new AccountInfoQuery()
        .setNodeAccountIds([response.nodeId])
        .setAccountId(aliasAccountId)
        .executeWithSigner(wallet);

    console.log(`Info about the new account: ${info.toString()}`);

    
     * Note that once an account exists in the ledger, it is assigned a normal AccountId, which can be retrieved
     * via an AccountInfoQuery.
     *
     * Users may continue to refer to the account by its aliasKey AccountId, but they may also
     * now refer to it by its normal AccountId
     *

    //console.log(`The normal account ID: ${info.accountId.toString()}`);

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
*/
export async function getAccountInfo(
  state: IdentitySnapState,
  account: string
): Promise<string> {
  const compressedKey = ethers.utils.computePublicKey(
    ethers.utils.arrayify(state.accountState[account].publicKey),
    true
  );

  async function mirrorQuery(url: RequestInfo | URL) {
    let response = await fetch(url);
    let info = await response.json();
    return info;
  }
  // Returns all account information for the given public key
  const accountInfoUrl = `https://testnet.mirrornode.hedera.com/api/v1/accounts?account.publickey=${compressedKey}`;
  let accountInfoResult = await mirrorQuery(accountInfoUrl);

  let accountId: string = '';
  // This Hbar account needs some HBAR to be activated on the ledger
  if (
    accountInfoResult.hasOwnProperty('accounts') &&
    accountInfoResult.accounts.length > 0
  ) {
    for (let i = 0; i < accountInfoResult.accounts.length; i++) {
      const result = accountInfoResult.accounts[i];
      if (result.evm_address === account) {
        accountId = result.account;
        break;
      }
    }
  } else {
    // This Hbar account is not activated on the ledger yet. Need to send some HBAR to this account to activate it first
    // TODO: Transfer HBAR to this account then get account info: https://github.com/hashgraph/hedera-sdk-js/blob/develop/examples/account-alias.js
  }
  console.log('accountId: ', accountId);
  return accountId;
}
