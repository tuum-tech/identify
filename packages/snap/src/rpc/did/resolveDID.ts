import { DIDResolutionResult } from '@veramo/core';
import { IdentitySnapParams } from '../../interfaces';
import { veramoResolveDID } from '../../utils/veramoUtils';

/* eslint-disable */
export async function resolveDID(
  identitySnapParams: IdentitySnapParams,
  didUrl?: string
): Promise<DIDResolutionResult | null> {
  return await veramoResolveDID(identitySnapParams, didUrl);
}
