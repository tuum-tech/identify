// import { ethers } from 'ethers';
// import { IdentitySnapState } from '../../interfaces';

/* eslint-disable */
/*
UNUSEDFUNCTION
This function is used to generate account ID from the EVM address. It'll return the accountID 
with a null aliasKey member with the form 
0.0.123
Note the prefix of "0.0" indicating the shard and realm
*/
/* export async function getAccountId(
  state: IdentitySnapState,
  account: string
): Promise<string> {
  const compressedKey = ethers.utils.computePublicKey(
    ethers.utils.arrayify(state.hederaAccount.publicKey),
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
  return accountId;
} */
