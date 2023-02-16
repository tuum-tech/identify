import { IdentitySnapParams } from '../../interfaces';

/* eslint-disable */
export async function getHederaAccountId(
  identitySnapParams: IdentitySnapParams
): Promise<string> {
  const { state } = identitySnapParams;

  return state.accountState[state.currentAccount].hederaAccount.accountId;
}
