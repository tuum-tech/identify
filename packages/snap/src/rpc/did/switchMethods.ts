import { divider, heading, panel, text } from '@metamask/snaps-ui';
import { IdentitySnapParams, SnapDialogParams } from '../../interfaces';
import { availableMethods, isValidMethod } from '../../types/constants';
import { updateSnapState } from '../snap/state';
import { snapDialog } from '../snap/utils';

/**
 * Function to switch method.
 *
 * @param identitySnapParams - Identity snap params.
 * @param didMethod - DID method.
 */
export async function switchMethod(
  identitySnapParams: IdentitySnapParams,
  didMethod: string,
): Promise<boolean> {
  const { snap, state } = identitySnapParams;

  const method =
    state.accountState[state.currentAccount].accountConfig.identity.didMethod;
  if (!isValidMethod(didMethod)) {
    console.error(
      `did method '${didMethod}' not supported. Supported methods are: ${availableMethods}`,
    );
    throw new Error(
      `did method ${didMethod}'not supported. Supported methods are: ${availableMethods}`,
    );
  }

  if (method !== didMethod) {
    const dialogParams: SnapDialogParams = {
      type: 'Confirmation',
      content: panel([
        heading('Switch to a different DID method to use'),
        text('Would you like to change did method to the following?'),
        divider(),
        text(`Current DID method: ${method}\nNew DID method: ${didMethod}`),
      ]),
    };

    if (await snapDialog(snap, dialogParams)) {
      state.accountState[
        state.currentAccount
      ].accountConfig.identity.didMethod = didMethod;
      await updateSnapState(snap, state);
      return true;
    }

    return false;
  }
  return false;
}
