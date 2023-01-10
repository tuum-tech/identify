import { SnapProvider } from '@metamask/snap-types';
import { IVerifyResult, VerifiablePresentation } from '@veramo/core';
import { IdentitySnapState } from '../../interfaces';
import { veramoVerifyVP } from '../../utils/veramoUtils';

/* eslint-disable */
export async function verifyVP(
  wallet: SnapProvider,
  state: IdentitySnapState,
  vc: VerifiablePresentation
): Promise<IVerifyResult | null> {
  return await veramoVerifyVP(wallet, state, vc);
}
