import { availableMethods } from '../../did/didMethods';

/* eslint-disable */
export function getAvailableMethods(): string[] {
  return availableMethods.map((key) => key);
}
