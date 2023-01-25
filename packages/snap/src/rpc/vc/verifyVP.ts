import { SnapProvider } from '@metamask/snap-types';
import { VerifiablePresentation } from '@veramo/core';
import { IdentitySnapState } from '../../interfaces';
import { veramoVerifyVP } from '../../utils/veramoUtils';

/* eslint-disable */
export async function verifyVP(
  wallet: SnapProvider,
  state: IdentitySnapState,
  vp: VerifiablePresentation
): Promise<boolean | null> {
  const result = await veramoVerifyVP(wallet, state, vp);
  if (result.verified === false) {
    console.log(
      'VP Verification Error: ',
      JSON.stringify(result.error, null, 4)
    );
  }
  return result.verified;
}
