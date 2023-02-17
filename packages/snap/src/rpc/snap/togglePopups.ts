import { heading, panel, text } from '@metamask/snaps-ui';
import { IdentitySnapParams, SnapDialogParams } from '../../interfaces';
import { snapDialog, updatePopups } from '../../utils/snapUtils';

/* eslint-disable */
export async function togglePopups(
  identitySnapParams: IdentitySnapParams
): Promise<boolean> {
  const { snap, state } = identitySnapParams;
  const { disablePopups } = state.snapConfig.dApp;

  const toggleTextToShow = disablePopups ? 'enable' : 'disable';
  const dialogParams: SnapDialogParams = {
    type: 'Confirmation',
    content: panel([
      heading('Toggle Popups'),
      text(`Would you like to ${toggleTextToShow} the popups?`),
    ]),
  };
  const result = await snapDialog(snap, dialogParams);
  if (result) {
    await updatePopups(snap, state);
    return true;
  }
  return false;
}
