import { validProofFormats } from '../../types/constants';

/* eslint-disable */
export function getSupportedProofFormats(): string[] {
  return validProofFormats.map((key) => key);
}
