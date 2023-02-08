import { IdentitySnapParams } from '../../interfaces';
import { SaveVCRequestParams } from '../../types/params';
import { snapConfirm } from '../../utils/snapUtils';
import { veramoSaveVC } from '../../utils/veramoUtils';
import { IDataManagerSaveResult } from '../../veramo/plugins/verfiable-creds-manager';

/* eslint-disable */
export async function saveVC(
  params: IdentitySnapParams,
  { verifiableCredential, options }: SaveVCRequestParams
): Promise<IDataManagerSaveResult[]> {
  const { snap, metamask } = params;

  const { store = 'snap' } = options || {};

  const promptObj = {
    prompt: 'Save VC',
    description: `Would you like to save the following VC in ${
      typeof store === 'string' ? store : store.join(', ')
    }?`,
    textAreaContent: JSON.stringify(verifiableCredential),
  };

  if (await snapConfirm(snap, promptObj)) {
    return await veramoSaveVC(snap, metamask, verifiableCredential, store);
  }
  throw new Error('User rejected');
}
