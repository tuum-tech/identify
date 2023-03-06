import { VerifiablePresentation } from '@veramo/core';
import { IdentitySnapParams } from '../../interfaces';
import { CreateVPRequestParams } from '../../types/params';
import { VeramoAgent } from '../../veramo/agent';

/**
 * Function to create verifiable presentation.
 *
 * @param identitySnapParams - Identity snap params.
 * @param vcRequestParams - VC request params.
 */
export async function createVP(
  identitySnapParams: IdentitySnapParams,
  vcRequestParams: CreateVPRequestParams,
): Promise<VerifiablePresentation | null> {
  // Get Veramo agent
  const agent = new VeramoAgent(identitySnapParams);
  return await agent.createVP(vcRequestParams);
}
