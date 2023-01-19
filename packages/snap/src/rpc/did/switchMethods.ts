import { SnapProvider } from '@metamask/snap-types';
import { IdentitySnapState } from '../../interfaces';
import { availableMethods, isValidMethod } from '../../types/constants';
import { snapConfirm } from '../../utils/snapUtils';
import { updateSnapState } from '../../utils/stateUtils';

/* eslint-disable */
export async function switchMethod(
  wallet: SnapProvider,
  state: IdentitySnapState,
  didMethod: string
): Promise<boolean> {
  const method =
    state.accountState[state.currentAccount].accountConfig.identity.didMethod;
  if (!isValidMethod(didMethod)) {
    console.error(
      `did method '${didMethod}' not supported. Supported methods are: ${availableMethods}`
    );
    throw new Error(
      `did method ${didMethod}'not supported. Supported methods are: ${availableMethods}`
    );
  }
  if (method !== didMethod) {
    const promptObj = {
      prompt: 'Change DID method',
      description: 'Would you like to change did method to the following?',
      textAreaContent: didMethod,
    };

    if (await snapConfirm(wallet, promptObj)) {
      state.accountState[
        state.currentAccount
      ].accountConfig.identity.didMethod = didMethod;
      await updateSnapState(wallet, state);
      return true;
    }

    return false;
  }
  return false;
}
