import { divider, heading, panel, text } from '@metamask/snaps-ui';
import { IdentitySnapParams, SnapDialogParams } from '../../interfaces';
import { SaveVCRequestParams } from '../../types/params';
import { veramoSaveVC } from '../../utils/veramoUtils';
import { IDataManagerSaveResult } from '../../veramo/plugins/verfiable-creds-manager';
import { snapDialog } from '../snap/utils';

/**
 * Function to save VC.
 *
 * @param params - Identity snap params.
 * @param options0 - Save VC request params.
 * @param options0.verifiableCredential - Verifiable Credential.
 * @param options0.options - Save VC options.
 */
export async function saveVC(
  params: IdentitySnapParams,
  { verifiableCredential, options }: SaveVCRequestParams,
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
        }?`,
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
