import { IdentitySnapParams } from '../../interfaces';

/**
 * Function to get Hedera account id.
 *
 * @param identitySnapParams - Identity snap params.
 */
export async function getHederaAccountId(
  identitySnapParams: IdentitySnapParams,
): Promise<string> {
  const { state } = identitySnapParams;

  return state.accountState[state.currentAccount].hederaAccount.accountId;
}
