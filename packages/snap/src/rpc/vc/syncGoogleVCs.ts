import { divider, heading, panel, text } from '@metamask/snaps-ui';
import { IdentitySnapParams, SnapDialogParams } from '../../interfaces';
import {
  createEmptyFile,
  getGoogleVCs,
  GOOGLE_DRIVE_VCS_FILE_NAME,
  uploadToGoogleDrive,
} from '../../utils/googleUtils';
import { snapDialog } from '../../utils/snapUtils';
import { updateSnapState } from '../../utils/stateUtils';

/**
 * Function to sync Google VCs with snap.
 *
 * @param identitySnapParams - Identity snap params.
 */
export async function syncGoogleVCs(
  identitySnapParams: IdentitySnapParams,
): Promise<boolean> {
  const { snap, state } = identitySnapParams;

  const currentVCs = state.accountState[state.currentAccount].vcs;
  let googleVCs = await getGoogleVCs(state, GOOGLE_DRIVE_VCS_FILE_NAME);

  if (!googleVCs) {
    await createEmptyFile(state, GOOGLE_DRIVE_VCS_FILE_NAME);
    // eslint-disable-next-line require-atomic-updates
    googleVCs = {};
  }

  const snapVCIds = Object.keys(currentVCs);
  const googleVCIds = Object.keys(googleVCs);
  const diffVCIds = googleVCIds.filter((id) => !snapVCIds.includes(id));

  const dialogParams: SnapDialogParams = {
    type: 'Confirmation',
    content: panel([
      heading('Sync Verifiable Credentials with Google Drive'),
      text(
        'Would you like to sync VCs in snap with google drive? After this, you will have all the VCs in both the snap and your google drive account',
      ),
      divider(),
      text(JSON.stringify(diffVCIds)),
    ]),
  };

  if (await snapDialog(snap, dialogParams)) {
    state.accountState[state.currentAccount].vcs = {
      ...currentVCs,
      ...diffVCIds.reduce((acc, id) => ({ ...acc, [id]: googleVCs[id] }), {}),
    };
    await updateSnapState(snap, state);

    // Save to google drive
    const gdriveResponse = await uploadToGoogleDrive(state, {
      fileName: GOOGLE_DRIVE_VCS_FILE_NAME,
      content: JSON.stringify(state.accountState[state.currentAccount].vcs),
    });
    console.log({ gdriveResponse });

    return true;
  }
  throw new Error('User rejected');
}
