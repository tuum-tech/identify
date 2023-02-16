import { W3CVerifiableCredential } from '@veramo/core';
import { IdentitySnapParams } from '../../interfaces';
import { veramoVerifyVC } from '../../utils/veramoUtils';

/* eslint-disable */
export async function verifyVC(
  identitySnapParams: IdentitySnapParams,
  vc: W3CVerifiableCredential
): Promise<boolean | null> {
  const { snap } = identitySnapParams;

  const result = await veramoVerifyVC(snap, vc);
  if (result.verified === false) {
    console.log(
      'VC Verification Error: ',
      JSON.stringify(result.error, null, 4)
    );
  }
  return result.verified;
}
