import { MetaMaskInpageProvider } from '@metamask/providers';
import { getDidPkhIdentifier } from '../did/pkh/pkhDidUtils';
import { IdentitySnapState } from '../interfaces';
import { availableMethods, isValidMethod } from '../types/constants';

/**
 * Function to get current Did.
 *
 * @param state - IdentitySnapState.
 * @param metamask - Metamask provider.
 */
export async function getCurrentDid(
  state: IdentitySnapState,
  metamask: MetaMaskInpageProvider,
): Promise<string> {
  let did = '';
  const method =
    state.accountState[state.currentAccount].accountConfig.identity.didMethod;
  if (!isValidMethod(method)) {
    console.error(
      `did method '${method}' not supported. Supported methods are: ${availableMethods}`,
    );
    throw new Error(
      `did method '${method}' not supported. Supported methods are: ${availableMethods}`,
    );
  }

  if (method === 'did:pkh') {
    const didUrl = await getDidPkhIdentifier(state, metamask);
    did = `did:pkh:${didUrl}`;
  }
  return did;
}
