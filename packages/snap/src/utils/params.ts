import { VerifiableCredential } from '@veramo/core';
import { IdentitySnapState } from '../interfaces';

/* eslint-disable */
type HederaAccountParams = {
  privateKey: string;
  accountId: string;
};

export function isValidHederaAccountParams(
  params: unknown
): asserts params is HederaAccountParams {
  if (
    params !== null &&
    typeof params === 'object' &&
    'privateKey' in params &&
    (params as HederaAccountParams).privateKey != null &&
    typeof (params as HederaAccountParams).privateKey === 'string' &&
    'accountId' in params &&
    (params as HederaAccountParams).accountId != null &&
    typeof (params as HederaAccountParams).accountId === 'string'
  )
    return;

  throw new Error('Invalid Hedera Params passed');
}

export function isHederaAccountImported(state: IdentitySnapState) {
  if (
    state.hederaAccount.privateKey !== null &&
    state.hederaAccount.publicKey !== null &&
    state.hederaAccount.accountId !== null
  )
    return;

  throw new Error(
    'Hedera Account has not yet been imported. Please call the "configure" API first'
  );
}

type SaveVCRequestParams = { verifiableCredential: VerifiableCredential };

export function isValidSaveVCRequest(
  params: unknown
): asserts params is SaveVCRequestParams {
  if (
    params !== null &&
    typeof params === 'object' &&
    'verifiableCredential' in params
  )
    return;

  throw new Error('Invalid SaveVC request');
}
