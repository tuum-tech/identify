import { divider, heading, panel, text } from '@metamask/snaps-ui';
import { W3CVerifiableCredential } from '@veramo/core';
import { IdentitySnapParams, SnapDialogParams } from '../../interfaces';
import {
  IDataManagerSaveResult,
  ISaveVC,
} from '../../plugins/veramo/verfiable-creds-manager';
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
        `Would you like to save the following VCs in ${
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

    const filteredCredentials: W3CVerifiableCredential[] =
      verifiableCredentials.filter((x: W3CVerifiableCredential) => {
        const vcObj = JSON.parse(JSON.stringify(x));
        const subjectDid: string = vcObj.credentialSubject.id;
        const subjectAccount = subjectDid.split(':')[4];
        return identitySnapParams.state.currentAccount === subjectAccount;
      });
    return await agent.saveVC(
      {
        data: filteredCredentials.map((x: W3CVerifiableCredential) => {
          return { vc: x } as ISaveVC;
        }) as ISaveVC[],
      },
      store,
    );
  }
  throw new Error('User rejected');
}
