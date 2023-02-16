import { VerifiablePresentation } from '@veramo/core';
import { IdentitySnapParams } from '../../interfaces';
import { veramoVerifyVP } from '../../utils/veramoUtils';

/* eslint-disable */
export async function verifyVP(
  identitySnapParams: IdentitySnapParams,
  vp: VerifiablePresentation
): Promise<boolean | null> {
  const { snap } = identitySnapParams;

  const result = await veramoVerifyVP(snap, vp);
  if (result.verified === false) {
    console.log(
      'VP Verification Error: ',
      JSON.stringify(result.error, null, 4)
    );
  }
  return result.verified;
}
