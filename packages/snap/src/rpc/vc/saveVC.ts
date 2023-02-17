import { divider, heading, panel, text } from '@metamask/snaps-ui';
import { IdentitySnapParams, SnapDialogParams } from '../../interfaces';
import { SaveVCRequestParams } from '../../types/params';
import { snapDialog } from '../../utils/snapUtils';
import { veramoSaveVC } from '../../utils/veramoUtils';
import { IDataManagerSaveResult } from '../../veramo/plugins/verfiable-creds-manager';

/* eslint-disable */
export async function saveVC(
  params: IdentitySnapParams,
  { verifiableCredential, options }: SaveVCRequestParams
): Promise<IDataManagerSaveResult[]> {
  const { snap } = params;

  const { store = 'snap' } = options || {};

  const dialogParams: SnapDialogParams = {
    type: 'Confirmation',
    content: panel([
      heading('Save Verifiable Credential'),
      text(
        `Would you like to save the following VC in ${
          typeof store === 'string' ? store : store.join(', ')
        }?`
      ),
      divider(),
      text(JSON.stringify(verifiableCredential)),
    ]),
  };

  if (await snapDialog(snap, dialogParams)) {
    return await veramoSaveVC(snap, verifiableCredential, store);
  }
  throw new Error('User rejected');
}
