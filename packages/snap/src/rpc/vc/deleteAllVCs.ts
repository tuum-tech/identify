import { IDataManagerClearResult } from 'src/veramo/plugins/verfiable-creds-manager';
import { IdentitySnapParams } from '../../interfaces';
import { DeleteAllVCsRequestParams } from '../../types/params';
import { snapConfirm } from '../../utils/snapUtils';
import { veramoDeleteAllVCs } from '../../utils/veramoUtils';

/* eslint-disable */
export async function deleteAllVCs(
  identitySnapParams: IdentitySnapParams,
  vcRequestParams: DeleteAllVCsRequestParams
): Promise<IDataManagerClearResult[] | null> {
  const { snap } = identitySnapParams;

  const { options } = vcRequestParams || {};
  const { store = 'snap' } = options || {};

  const promptObj = {
    prompt: 'Delete all VCs',
    description: `Would you like to delete all the VCs?`,
    textAreaContent: `Note that this action cannot be reversed and you will need to recreate all your VCs if you go through with it`,
  };

  if (await snapConfirm(snap, promptObj)) {
    return await veramoDeleteAllVCs(snap, store);
  }
  throw new Error('User rejected');
}
