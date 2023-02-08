import { SnapProvider } from '@metamask/snap-types';
import { IdentitySnapState } from '../../interfaces';
import { CreateVCRequestParams } from '../../types/params';
import { snapConfirm } from '../../utils/snapUtils';
import { veramoCreateVC } from '../../utils/veramoUtils';
import { IDataManagerSaveResult } from '../../veramo/plugins/verfiable-creds-manager';
import {
  GOOGLE_DRIVE_VCS_FILE_NAME,
  uploadToGoogleDrive,
} from '../store/gdrive';

/* eslint-disable */
export async function createVC(
  wallet: SnapProvider,
  state: IdentitySnapState,
  params: CreateVCRequestParams,
): Promise<IDataManagerSaveResult[]> {
  const { vcKey = 'vcData', vcValue, credTypes = [], options } = params || {};
  const { store = 'snap' } = options || {};

  const currentVCs = state.accountState[state.currentAccount].vcs;
  const gdriveResponse = await uploadToGoogleDrive(state, {
    fileName: GOOGLE_DRIVE_VCS_FILE_NAME,
    content: JSON.stringify({ ...currentVCs, [vcKey]: vcValue }),
  });
  console.log({ gdriveResponse });

  const promptObj = {
    prompt: 'Create and Save VC',
    description: `Would you like to create and save the following VC in snap?`,
    textAreaContent: JSON.stringify({
      [vcKey]: vcValue,
    }),
  };
  if (await snapConfirm(wallet, promptObj)) {
    const snapResponse = await veramoCreateVC(
      wallet,
      state,
      vcKey,
      vcValue,
      store,
      credTypes,
    );
    return snapResponse;
  }
  throw new Error('User rejected');
}
