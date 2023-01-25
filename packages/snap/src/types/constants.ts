import { ProofFormat } from '@veramo/core';

/* eslint-disable */
export const isIn = <T>(values: readonly T[], value: any): value is T => {
  return values.includes(value);
};

export const availableVCStores = ['snap'] as const;
export const isValidVCStore = (x: string) => isIn(availableVCStores, x);

export const availableMethods = ['did:pkh'] as const;
export const isValidMethod = (x: string) => isIn(availableMethods, x);

export const validProofFormats = [
  'jwt' as ProofFormat,
  'lds' as ProofFormat,
  'EthereumEip712Signature2021' as ProofFormat,
] as const;
export const isValidProofFormat = (x: string) => isIn(validProofFormats, x);
