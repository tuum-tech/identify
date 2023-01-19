import { SnapProvider } from '@metamask/snap-types';
import { IdentitySnapState } from '../../interfaces';
import { SaveVCRequestParams } from '../../types/params';
import { snapConfirm } from '../../utils/snapUtils';
import { veramoSaveVC } from '../../utils/veramoUtils';
import { IDataManagerSaveResult } from '../../veramo/plugins/verfiable-creds-manager';

/* eslint-disable */
export async function saveVC(
  wallet: SnapProvider,
  state: IdentitySnapState,
  { verifiableCredential, options }: SaveVCRequestParams
): Promise<IDataManagerSaveResult[]> {
  const { store = 'snap' } = options || {};

  const promptObj = {
    prompt: 'Save VC',
    description: `Would you like to save the following VC in ${
      typeof store === 'string' ? store : store.join(', ')
    }?`,
    textAreaContent: JSON.stringify(verifiableCredential, null, 4),
  };

  if (await snapConfirm(wallet, promptObj)) {
    return await veramoSaveVC(wallet, state, verifiableCredential, store);
  }
  throw new Error('User rejected');
}
