import { SnapProvider } from '@metamask/snap-types';
import { DIDResolutionResult } from '@veramo/core';
import { IdentitySnapState } from '../../interfaces';
import { veramoResolveDID } from '../../utils/veramoUtils';

/* eslint-disable */
export async function resolveDID(
  wallet: SnapProvider,
  state: IdentitySnapState,
  didUrl?: string
): Promise<DIDResolutionResult | null> {
  return await veramoResolveDID(wallet, state, didUrl);
}
