import { SnapProvider } from '@metamask/snap-types';
import { W3CVerifiableCredential } from '@veramo/core';
import { IdentitySnapState } from '../../interfaces';
import { veramoVerifyVC } from '../../utils/veramoUtils';

/* eslint-disable */
export async function verifyVC(
  wallet: SnapProvider,
  state: IdentitySnapState,
  vc: W3CVerifiableCredential
): Promise<boolean | null> {
  const result = await veramoVerifyVC(wallet, state, vc);
  if (result.verified === false) {
    console.log(
      'VC Verification Error: ',
      JSON.stringify(result.error, null, 4)
    );
  }
  return result.verified;
}
