import { SnapProvider } from '@metamask/snap-types';
import { IDataManagerClearResult } from 'src/veramo/plugins/verfiable-creds-manager';
import { IdentitySnapState } from '../../interfaces';
import { DeleteAllVCsRequestParams } from '../../types/params';
import { snapConfirm } from '../../utils/snapUtils';
import { veramoDeleteAllVCs } from '../../utils/veramoUtils';

/* eslint-disable */
export async function deleteAllVCs(
  wallet: SnapProvider,
  state: IdentitySnapState,
  params: DeleteAllVCsRequestParams
): Promise<IDataManagerClearResult[] | null> {
  const { options } = params || {};
  const { store = 'snap' } = options || {};

  const promptObj = {
    prompt: 'Delete all VCs',
    description: `Would you like to delete all the VCs?`,
    textAreaContent: `Note that this action cannot be reversed and you will need to recreate all your VCs if you go through with it`,
  };

  if (await snapConfirm(wallet, promptObj)) {
    return await veramoDeleteAllVCs(wallet, state, store);
  }
  throw new Error('User rejected');
}
