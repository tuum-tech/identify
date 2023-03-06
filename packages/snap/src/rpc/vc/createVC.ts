import { divider, heading, panel, text } from '@metamask/snaps-ui';
import { IdentitySnapParams, SnapDialogParams } from '../../interfaces';
import { IDataManagerSaveResult } from '../../plugins/veramo/verfiable-creds-manager';
import { snapDialog } from '../../snap/dialog';
import { CreateVCRequestParams } from '../../types/params';
import { VeramoAgent } from '../../veramo/agent';

/**
 * Function to create VC.
 *
 * @param identitySnapParams - Identity snap params.
 * @param vcRequestParams - VC request params.
 */
export async function createVC(
  identitySnapParams: IdentitySnapParams,
  vcRequestParams: CreateVCRequestParams,
): Promise<IDataManagerSaveResult[]> {
  const { snap } = identitySnapParams;

  const {
    vcKey = 'vcData',
    vcValue,
    credTypes = [],
    options,
  } = vcRequestParams || {};
  const { store = 'snap' } = options || {};

  const dialogParams: SnapDialogParams = {
    type: 'Confirmation',
    content: panel([
      heading('Create Verifiable Credential'),
      text('Would you like to create and save the following VC in the snap?'),
      divider(),
      text(
        JSON.stringify({
          [vcKey]: vcValue,
        }),
      ),
    ]),
  };

  if (await snapDialog(snap, dialogParams)) {
    // Get Veramo agent
    const agent = new VeramoAgent(identitySnapParams);
    return await agent.createVC(vcKey, vcValue, store, credTypes);
  }
  throw new Error('User rejected');
}
