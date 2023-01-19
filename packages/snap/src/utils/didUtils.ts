import { SnapProvider } from '@metamask/snap-types';
import { getDidPkhIdentifier } from '../did/pkh/pkhDidUtils';
import { IdentitySnapState } from '../interfaces';
import { availableMethods, isValidMethod } from '../types/constants';

/* eslint-disable */
export async function getCurrentDid(
  wallet: SnapProvider,
  state: IdentitySnapState
): Promise<string> {
  let did: string = '';
  const method =
    state.accountState[state.currentAccount].accountConfig.identity.didMethod;

  if (!isValidMethod(method)) {
    console.error(
      `did method '${method}' not supported. Supported methods are: ${availableMethods}`
    );
    throw new Error(
      `did method '${method}' not supported. Supported methods are: ${availableMethods}`
    );
  }

  if (method === 'did:pkh') {
    const didUrl = await getDidPkhIdentifier(wallet, state);
    did = `did:pkh:${didUrl}`;
  }
  return did;
}
