import { VerifiablePresentation } from '@veramo/core';
import { IdentitySnapParams } from 'src/interfaces';
import { CreateVPRequestParams } from '../../types/params';
import { veramoCreateVP } from '../../utils/veramoUtils';

/**
 * Function to create verifiable presentation.
 *
 * @param identitySnapParams - Identity snap params.
 * @param vcRequestParams - VC request params.
 */
export async function createVP(
  identitySnapParams: IdentitySnapParams,
  vcRequestParams: CreateVPRequestParams,
): Promise<VerifiablePresentation | null> {
  return await veramoCreateVP(identitySnapParams, vcRequestParams);
}
