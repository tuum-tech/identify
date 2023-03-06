import { divider, heading, panel, text } from '@metamask/snaps-ui';
import { IdentitySnapParams, SnapDialogParams } from '../../interfaces';
import { IDataManagerClearResult } from '../../plugins/veramo/verfiable-creds-manager';
import { snapDialog } from '../../snap/dialog';
import { DeleteAllVCsRequestParams } from '../../types/params';
import { VeramoAgent } from '../../veramo/agent';

/**
 * Function to delete all VCs.
 *
 * @param identitySnapParams - Identity snap params.
 * @param vcRequestParams - VC request params.
 */
export async function deleteAllVCs(
  identitySnapParams: IdentitySnapParams,
  vcRequestParams: DeleteAllVCsRequestParams,
): Promise<IDataManagerClearResult[] | null> {
  const { snap } = identitySnapParams;

  const { options } = vcRequestParams || {};
  const { store = 'snap' } = options || {};

  const dialogParams: SnapDialogParams = {
    type: 'Confirmation',
    content: panel([
      heading('Delete all Verifiable Credentials'),
      text('Would you like to delete all the VCs?'),
      divider(),
      text(
        `Note that this action cannot be reversed and you will need to recreate all your VCs if you go through with it`,
      ),
    ]),
  };

  if (await snapDialog(snap, dialogParams)) {
    // Get Veramo agent
    const agent = new VeramoAgent(identitySnapParams);
    return await agent.deleteAllVCs(store);
  }
  throw new Error('User rejected');
}
