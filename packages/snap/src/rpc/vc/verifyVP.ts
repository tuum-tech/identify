import { VerifiablePresentation } from '@veramo/core';
import { IdentitySnapParams } from '../../interfaces';
import { VeramoAgent } from '../../veramo/agent';

/**
 * Function to verify VP.
 *
 * @param identitySnapParams - Identity snap params.
 * @param vp - Verifiable Presentation.
 */
export async function verifyVP(
  identitySnapParams: IdentitySnapParams,
  vp: VerifiablePresentation,
): Promise<boolean | null> {
  // Get Veramo agent
  const agent = new VeramoAgent(identitySnapParams);
  const result = await agent.verifyVP(vp);
  if (result.verified === false) {
    console.log(
      'VP Verification Error: ',
      JSON.stringify(result.error, null, 4),
    );
  }
  return result.verified;
}
