import { SnapProvider } from '@metamask/snap-types';
import { IdentitySnapState } from '../../interfaces';
import { snapConfirm, updatePopups } from '../../utils/snapUtils';

/* eslint-disable */
export async function togglePopups(
  wallet: SnapProvider,
  state: IdentitySnapState
): Promise<boolean> {
  const { disablePopups } = state.snapConfig.dApp;

  const promptObj = {
    prompt: 'Toggle Popups',
    description: 'Would you like to toggle the popups to following?',
    textAreaContent: disablePopups
      ? 'Current setting: True\nNew setting: False'
      : 'Current setting: False\nNew setting: True',
  };
  const result = disablePopups || snapConfirm(wallet, promptObj);
  if (result) {
    await updatePopups(wallet, state);
    return true;
  }
  return false;
}
