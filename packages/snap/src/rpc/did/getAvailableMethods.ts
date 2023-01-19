import { availableMethods } from '../../types/constants';

/* eslint-disable */
export function getAvailableMethods(): string[] {
  return availableMethods.map((key) => key);
}
