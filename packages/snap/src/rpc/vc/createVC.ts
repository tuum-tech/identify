import { IdentitySnapParams } from '../../interfaces';
import { CreateVCRequestParams } from '../../types/params';
import { snapConfirm } from '../../utils/snapUtils';
import { veramoCreateVC } from '../../utils/veramoUtils';
import { IDataManagerSaveResult } from '../../veramo/plugins/verfiable-creds-manager';

/* eslint-disable */
export async function createVC(
  identitySnapParams: IdentitySnapParams,
  vcRequestParams: CreateVCRequestParams
): Promise<IDataManagerSaveResult[]> {
  const { snap } = identitySnapParams;

  const {
    vcKey = 'vcData',
    vcValue,
    credTypes = [],
    options,
  } = vcRequestParams || {};
  const { store = 'snap' } = options || {};

  const promptObj = {
    prompt: 'Create and Save VC',
    description: `Would you like to create and save the following VC in snap?`,
    textAreaContent: JSON.stringify({
      [vcKey]: vcValue,
    }),
  };
  if (await snapConfirm(snap, promptObj)) {
    return await veramoCreateVC(
      identitySnapParams,
      vcKey,
      vcValue,
      store,
      credTypes
    );
  }
  throw new Error('User rejected');
}
