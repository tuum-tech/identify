import { IdentitySnapParams } from '../../interfaces';
import { getAccountStateByCoinType } from '../../snap/state';

/**
 * Function to get Hedera account id.
 *
 * @param identitySnapParams - Identity snap params.
 */
export async function getHederaAccountId(
  identitySnapParams: IdentitySnapParams,
): Promise<string> {
  const { state, account } = identitySnapParams;

  const accountState = await getAccountStateByCoinType(
    state,
    account.evmAddress,
  );

  const hederaAccountId = accountState.extraData
    ? (accountState.extraData as string)
    : '';
  if (hederaAccountId) {
    return hederaAccountId;
  }
  throw new Error(
    'Hedera Account has not yet been configured. Please connect to Hedera account using connectHederaAccount API first',
  );
}
