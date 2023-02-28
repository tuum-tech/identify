import { SnapsGlobalObject } from '@metamask/snaps-types';
import { heading, panel, text } from '@metamask/snaps-ui';
import { IdentitySnapState, SnapDialogParams } from '../interfaces';
import { initSnapState } from '../snap/state';
import { snapDialog } from '../snap/dialog';

/**
 * Init snap state.
 *
 * @param snap - Snap.
 */
export async function init(
  snap: SnapsGlobalObject,
): Promise<IdentitySnapState> {
  const dialogParams: SnapDialogParams = {
    type: 'Alert',
    content: panel([
      heading('Risks about using Identity Snap'),
      text(
        'Applications do NOT have access to your private keys. You are in control of what VCs and VPs you sign and what you use your DIDs for.',
      ),
    ]),
  };

  await snapDialog(snap, dialogParams);
  console.log('starting init');
  return await initSnapState(snap);
}
