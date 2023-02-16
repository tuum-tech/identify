import { VerifiablePresentation } from '@veramo/core';
import { IdentitySnapParams } from 'src/interfaces';
import { CreateVPRequestParams } from '../../types/params';
import { veramoCreateVP } from '../../utils/veramoUtils';

/* eslint-disable */
export async function createVP(
  identitySnapParams: IdentitySnapParams,
  vcRequestParams: CreateVPRequestParams
): Promise<VerifiablePresentation | null> {
  return await veramoCreateVP(identitySnapParams, vcRequestParams);
}
