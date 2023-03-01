import { W3CVerifiableCredential } from '@veramo/core';
import { IdentitySnapParams } from '../../interfaces';
import { veramoVerifyVC } from '../../utils/veramoUtils';

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
  const { snap } = identitySnapParams;

  const result = await veramoVerifyVC(snap, vc);
  if (result.verified === false) {
    console.log('result: ', JSON.stringify(result, null, 4));
    console.log(
      'VC Verification Error: ',
      JSON.stringify(result.error, null, 4),
    );
  }
  return result.verified;
}
