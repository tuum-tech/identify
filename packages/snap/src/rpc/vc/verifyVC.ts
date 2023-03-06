import { W3CVerifiableCredential } from '@veramo/core';
import { IdentitySnapParams } from '../../interfaces';
import { VeramoAgent } from '../../veramo/agent';

/**
 * Function to verify VC.
 *
 * @param identitySnapParams - Identity snap params.
 * @param vc - Verifiable Credential.
 */
export async function verifyVC(
  identitySnapParams: IdentitySnapParams,
  vc: W3CVerifiableCredential,
): Promise<boolean | null> {
  // Get Veramo agent
  const agent = new VeramoAgent(identitySnapParams);
  const result = await agent.verifyVC(vc);
  if (result.verified === false) {
    console.log('result: ', JSON.stringify(result, null, 4));
    console.log(
      'VC Verification Error: ',
      JSON.stringify(result.error, null, 4),
    );
  }
  return result.verified;
}
