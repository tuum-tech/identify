import { SnapProvider } from '@metamask/snap-types';
import { availableMethods } from '../../did/didMethods';
import { IdentitySnapState } from '../../interfaces';
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
  const newDidMethod = availableMethods.find((k) => k === didMethod);
  if (!newDidMethod) {
    throw new Error(
      'did method not supported. Supported methods are: ["did:pkh"]'
    );
  }
  if (method !== newDidMethod) {
    const promptObj = {
      prompt: 'Change DID method',
      description: 'Would you like to change did method to the following?',
      textAreaContent: newDidMethod,
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
