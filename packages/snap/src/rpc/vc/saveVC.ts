import { divider, heading, panel, text } from '@metamask/snaps-ui';
import { IdentitySnapParams, SnapDialogParams } from '../../interfaces';
import { SaveVCRequestParams } from '../../types/params';
import { veramoSaveVC } from '../../utils/veramoUtils';
import { IDataManagerSaveResult } from '../../veramo/plugins/verfiable-creds-manager';
import { snapDialog } from '../snap/utils';

/**
 * Function to save VC.
 *
 * @param identitySnapParams - Identity snap params.
 * @param options0 - Save VC request params.
 * @param options0.verifiableCredential - Verifiable Credential.
 * @param options0.options - Save VC options.
 */
export async function saveVC(
  identitySnapParams: IdentitySnapParams,
  { verifiableCredential, options }: SaveVCRequestParams,
): Promise<IDataManagerSaveResult[]> {
  const { snap } = identitySnapParams;

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
    return await veramoSaveVC(identitySnapParams, verifiableCredential, store);
  }
  throw new Error('User rejected');
}
