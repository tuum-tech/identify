import { IdentitySnapParams } from '../../interfaces';

/**
 * Get did.
 *
 * @param identitySnapParams - Identity snap params.
 */
export async function getDid(
  identitySnapParams: IdentitySnapParams,
): Promise<string> {
  const { account } = identitySnapParams;
  return account.identifier.did;
}
