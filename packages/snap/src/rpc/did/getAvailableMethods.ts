import { availableMethods } from '../../types/constants';

/**
 * Function to get available methods.
 *
 * @returns Available methods.
 */
export function getAvailableMethods(): string[] {
  return availableMethods.map((key) => key);
}
