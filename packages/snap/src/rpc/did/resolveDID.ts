import { DIDResolutionResult } from '@veramo/core';
import { IdentitySnapParams } from '../../interfaces';
import { veramoResolveDID } from '../../utils/veramoUtils';

/**
 * Resolve DID.
 *
 * @param identitySnapParams - Identity snap params.
 * @param didUrl - DID url.
 */
export async function resolveDID(
  identitySnapParams: IdentitySnapParams,
  didUrl?: string,
): Promise<DIDResolutionResult | null> {
  return await veramoResolveDID(identitySnapParams, didUrl);
}
