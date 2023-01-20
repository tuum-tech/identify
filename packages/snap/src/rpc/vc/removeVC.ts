import { SnapProvider } from '@metamask/snap-types';
import { IDataManagerDeleteResult } from 'src/veramo/plugins/verfiable-creds-manager';
import { IdentitySnapState } from '../../interfaces';
import { RemoveVCsRequestParams } from '../../types/params';
import { snapConfirm } from '../../utils/snapUtils';
import { veramoRemoveVC } from '../../utils/veramoUtils';

/* eslint-disable */
/* export async function removeVC(
  wallet: SnapProvider,
  state: IdentitySnapState,
  params: RemoveVCsRequestParams
): Promise<RemoveVCRequestResult[]> {
  const { id = [], options } = params || {};
  const { store = 'snap' } = options || {};

  const promptObj = {
    prompt: 'Remove VC',
    description: `Would you like to remove the following VCs?`,
    textAreaContent: JSON.stringify(id),
  };

  if (await snapConfirm(wallet, promptObj)) {
    return await veramoRemoveVC(wallet, state, id, store);
  }
  throw new Error('User rejected');
} */

export async function removeVC(
  wallet: SnapProvider,
  state: IdentitySnapState,
  params: RemoveVCsRequestParams
): Promise<IDataManagerDeleteResult[] | null> {
  const { id = '', options } = params || {};
  const { store = 'snap' } = options || {};

  const ids = typeof id === 'string' ? [id] : id;
  if (ids.length === 0) return null;

  const promptObj = {
    prompt: 'Remove VC',
    description: `Would you like to remove the following VC IDs?`,
    textAreaContent: JSON.stringify(id),
  };

  if (await snapConfirm(wallet, promptObj)) {
    return await veramoRemoveVC(wallet, state, ids, store);
  }
  throw new Error('User rejected');
}
