import { IdentitySnapParams } from '../../interfaces';
import { getCurrentDid } from '../../utils/didUtils';

/**
 * Get did.
 *
 * @param identitySnapParams - Identity snap params.
 */
export async function getDid(
  identitySnapParams: IdentitySnapParams,
): Promise<string> {
  const { state, metamask } = identitySnapParams;
  return await getCurrentDid(state, metamask);
}
