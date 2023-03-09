import { divider, heading, panel, text } from '@metamask/snaps-ui';
import { IdentitySnapParams, SnapDialogParams } from '../../interfaces';
import { IDataManagerSaveResult } from '../../plugins/veramo/verfiable-creds-manager';
import { snapDialog } from '../../snap/dialog';
import { SaveVCRequestParams } from '../../types/params';
import { VeramoAgent } from '../../veramo/agent';

/**
 * Function to save VC.
 *
 * @param identitySnapParams - Identity snap params.
 * @param options0 - Save VC request params.
 * @param options0.verifiableCredentials - Verifiable Credential.
 * @param options0.options - Save VC options.
 */
export async function saveVC(
  identitySnapParams: IdentitySnapParams,
  { verifiableCredentials, options }: SaveVCRequestParams,
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
      text(JSON.stringify(verifiableCredentials)),
    ]),
  };

  if (await snapDialog(snap, dialogParams)) {
    // Get Veramo agent
    const agent = new VeramoAgent(identitySnapParams);
    return await agent.saveVC(
      { data: verifiableCredentials.map((x) => ({ vc: x })) },
      store,
    );
  }
  throw new Error('User rejected');
}
