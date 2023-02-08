import { IdentitySnapParams } from '../../interfaces';
import { snapConfirm, updatePopups } from '../../utils/snapUtils';

/* eslint-disable */
export async function togglePopups(
  identitySnapParams: IdentitySnapParams
): Promise<boolean> {
  const { snap, state } = identitySnapParams;
  const { disablePopups } = state.snapConfig.dApp;

  const promptObj = {
    prompt: 'Toggle Popups',
    description: 'Would you like to toggle the popups to following?',
    textAreaContent: disablePopups
      ? 'Current setting: True\nNew setting: False'
      : 'Current setting: False\nNew setting: True',
  };
  const result = disablePopups || snapConfirm(snap, promptObj);
  if (result) {
    await updatePopups(snap, state);
    return true;
  }
  return false;
}
