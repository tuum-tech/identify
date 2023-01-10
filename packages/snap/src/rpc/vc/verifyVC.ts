import { SnapProvider } from '@metamask/snap-types';
import { IVerifyResult, VerifiableCredential } from '@veramo/core';
import { IdentitySnapState } from '../../interfaces';
import { veramoVerifyVC } from '../../utils/veramoUtils';

/* eslint-disable */
export async function verifyVC(
  wallet: SnapProvider,
  state: IdentitySnapState,
  vc: VerifiableCredential
): Promise<IVerifyResult | null> {
  return await veramoVerifyVC(wallet, state, vc);
}
