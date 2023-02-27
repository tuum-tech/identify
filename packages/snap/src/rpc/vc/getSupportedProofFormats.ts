import { validProofFormats } from '../../types/constants';

/**
 * Function to get supported proof formats.
 *
 * @returns Proof formats.
 */
export function getSupportedProofFormats(): string[] {
  return validProofFormats.map((key) => key);
}
