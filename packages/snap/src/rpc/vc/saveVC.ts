import { SnapProvider } from '@metamask/snap-types';
import { VerifiableCredential } from '@veramo/core';
import { IdentitySnapState } from '../../interfaces';
import { snapConfirm } from '../../utils/snapUtils';
import { veramoSaveVC } from '../../utils/veramoUtils';

/* eslint-disable */
export async function saveVC(
  wallet: SnapProvider,
  state: IdentitySnapState,
  vc: VerifiableCredential
) {
  const account = state.currentAccount;
  const promptObj = {
    prompt: 'Save VC',
    description: `Would you like to save the following VC in ${state.accountState[account].accountConfig.identity.vcStore}?`,
    textAreaContent: JSON.stringify(vc.credentialSubject),
  };
  if (await snapConfirm(wallet, promptObj)) {
    return await veramoSaveVC(
      wallet,
      state,
      vc,
      state.accountState[account].accountConfig.identity.vcStore
    );
  }
  return false;
}
