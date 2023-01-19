import { SnapProvider } from '@metamask/snap-types';
import { VerifiablePresentation } from '@veramo/core';
import { IdentitySnapState } from '../../interfaces';
import { CreateVPRequestParams } from '../../types/params';
import { veramoCreateVP } from '../../utils/veramoUtils';

/* eslint-disable */
export async function createVP(
  wallet: SnapProvider,
  state: IdentitySnapState,
  params: CreateVPRequestParams
): Promise<VerifiablePresentation | null> {
  return await veramoCreateVP(wallet, state, params);
}
