import { divider, heading, panel, text } from '@metamask/snaps-ui';
import { W3CVerifiableCredential } from '@veramo/core';
import { IdentitySnapParams, SnapDialogParams } from '../../interfaces';
import {
  IDataManagerSaveArgs,
  IDataManagerSaveResult,
  SaveOptions,
} from '../../plugins/veramo/verfiable-creds-manager';
import { snapDialog } from '../../snap/dialog';
import { getAccountStateByCoinType } from '../../snap/state';
import { getVeramoAgent } from '../../veramo/agent';

/**
 * Function to save VC.
 *
 * @param identitySnapParams - Identity snap params.
 * @param vcSaveRequestParams - VC save request params.
 */
export async function saveVC(
  identitySnapParams: IdentitySnapParams,
  vcSaveRequestParams: IDataManagerSaveArgs,
): Promise<IDataManagerSaveResult[]> {
  const { snap, state, account } = identitySnapParams;

  const { data: verifiableCredential, options } = vcSaveRequestParams || {};
  const { store = 'snap' } = options || {};

  const optionsFiltered = { store } as SaveOptions;

  // Get Veramo agent
  const agent = await getVeramoAgent(snap, state);

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
    // Save the Verifiable Credential
    const accountState = await getAccountStateByCoinType(
      state,
      account.evmAddress,
    );
    return (await agent.saveVC({
      data: verifiableCredential as W3CVerifiableCredential,
      options: optionsFiltered,
      accessToken: accountState.accountConfig.identity.googleAccessToken,
    })) as IDataManagerSaveResult[];
  }
  throw new Error('User rejected');
}
