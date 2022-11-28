import { VerifiableCredential } from '@veramo/core';

type SaveVCRequestParams = { verifiableCredential: VerifiableCredential };

export function isValidSaveVCRequest(
  params: unknown
): asserts params is SaveVCRequestParams {
  if (
    params != null &&
    typeof params === 'object' &&
    'verifiableCredential' in params
  )
    return;

  throw new Error('Invalid SaveVC request');
}
