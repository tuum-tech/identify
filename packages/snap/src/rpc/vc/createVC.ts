import { SnapProvider } from '@metamask/snap-types';
import { IdentitySnapState } from '../../interfaces';
import { CreateVCRequestParams } from '../../types/params';
import { snapConfirm } from '../../utils/snapUtils';
import { veramoCreateVC } from '../../utils/veramoUtils';
import { IDataManagerSaveResult } from '../../veramo/plugins/verfiable-creds-manager';

/* eslint-disable */
export async function createVC(
  wallet: SnapProvider,
  state: IdentitySnapState,
  params: CreateVCRequestParams
): Promise<IDataManagerSaveResult[]> {
  const { vcKey = 'vcData', vcValue, options } = params || {};
  const { store = 'snap' } = options || {};

  const promptObj = {
    prompt: 'Create and Save VC',
    description: `Would you like to create and save the following VC in snap?`,
    textAreaContent: JSON.stringify({
      [vcKey]: vcValue,
    }),
  };
  if (await snapConfirm(wallet, promptObj)) {
    return await veramoCreateVC(wallet, state, vcKey, vcValue, store);
  }
  throw new Error('User rejected');
}
