import { divider, heading, panel, text } from '@metamask/snaps-ui';
import { IdentitySnapParams, SnapDialogParams } from '../../interfaces';
import {
  ClearOptions,
  IDataManagerClearArgs,
  IDataManagerClearResult,
} from '../../plugins/veramo/verfiable-creds-manager';
import { snapDialog } from '../../snap/dialog';
import { getAccountStateByCoinType } from '../../snap/state';
import { getVeramoAgent } from '../../veramo/agent';

/**
 * Function to delete all VCs.
 *
 * @param identitySnapParams - Identity snap params.
 * @param vcRequestParams - VC request params.
 */
export async function deleteAllVCs(
  identitySnapParams: IdentitySnapParams,
  vcRequestParams: IDataManagerClearArgs,
): Promise<IDataManagerClearResult[] | null> {
  const { snap, state, account } = identitySnapParams;
  const { options } = vcRequestParams || {};
  const { store = 'snap' } = options || {};
  const optionsFiltered = { store } as ClearOptions;

  // Get Veramo agent
  const agent = await getVeramoAgent(snap, state);

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
    // Remove all the Verifiable Credentials from the store
    const accountState = await getAccountStateByCoinType(
      state,
      account.evmAddress,
    );
    return await agent.clearVCs({
      options: optionsFiltered,
      accessToken: accountState.accountConfig.identity.googleAccessToken,
    });
  }
  throw new Error('User rejected');
}
