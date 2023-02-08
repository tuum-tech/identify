import { IDataManagerDeleteResult } from 'src/veramo/plugins/verfiable-creds-manager';
import { IdentitySnapParams } from '../../interfaces';
import { RemoveVCsRequestParams } from '../../types/params';
import { snapConfirm } from '../../utils/snapUtils';
import { veramoRemoveVC } from '../../utils/veramoUtils';

/* eslint-disable */
export async function removeVC(
  identitySnapParams: IdentitySnapParams,
  vcRequestParams: RemoveVCsRequestParams
): Promise<IDataManagerDeleteResult[] | null> {
  const { snap, metamask } = identitySnapParams;

  const { id = '', options } = vcRequestParams || {};
  const { store = 'snap' } = options || {};

  const ids = typeof id === 'string' ? [id] : id;
  if (ids.length === 0) return null;

  const promptObj = {
    prompt: 'Remove VC',
    description: `Would you like to remove the following VC IDs?`,
    textAreaContent: JSON.stringify(id),
  };

  if (await snapConfirm(snap, promptObj)) {
    return await veramoRemoveVC(snap, metamask, ids, store);
  }
  throw new Error('User rejected');
}
