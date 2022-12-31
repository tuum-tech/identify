import { SnapProvider } from '@metamask/snap-types';
import { VerifiablePresentation } from '@veramo/core';
import { IdentitySnapState } from '../../interfaces';
import { veramoCreateVP } from '../../utils/veramoUtils';

/* eslint-disable */
export async function getVP(
  wallet: SnapProvider,
  state: IdentitySnapState,
  vcId: string,
  domain?: string,
  challenge?: string
): Promise<VerifiablePresentation | null> {
  return await veramoCreateVP(wallet, state, vcId, challenge, domain);
}
