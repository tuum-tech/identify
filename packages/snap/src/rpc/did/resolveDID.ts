import { DIDResolutionResult } from '@veramo/core';
import { IdentitySnapParams } from '../../interfaces';
import { VeramoAgent } from '../../veramo/agent';

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
  // Get Veramo agent
  const agent = new VeramoAgent(identitySnapParams);
  return await agent.resolveDid(didUrl);
}
