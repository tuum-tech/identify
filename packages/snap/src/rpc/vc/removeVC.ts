import { divider, heading, panel, text } from '@metamask/snaps-ui';
import { IdentitySnapParams, SnapDialogParams } from '../../interfaces';
import {
  DeleteOptions,
  IDataManagerDeleteArgs,
  IDataManagerDeleteResult,
} from '../../plugins/veramo/verfiable-creds-manager';
import { snapDialog } from '../../snap/dialog';
import { getAccountStateByCoinType } from '../../snap/state';
import { getVeramoAgent } from '../../veramo/agent';

/**
 * Function to remove VC.
 *
 * @param identitySnapParams - Identity snap params.
 * @param vcRequestParams - VC request params.
 */
export async function removeVC(
  identitySnapParams: IdentitySnapParams,
  vcRequestParams: IDataManagerDeleteArgs,
): Promise<IDataManagerDeleteResult[] | null> {
  const { snap, state, account } = identitySnapParams;

  const { id = '', options } = vcRequestParams || {};
  const { store = 'snap' } = options || {};
  const optionsFiltered = { store } as DeleteOptions;

  // Get Veramo agent
  const agent = await getVeramoAgent(snap, state);

  const ids = typeof id === 'string' ? [id] : id;
  if (ids.length === 0) {
    return null;
  }

  const dialogParams: SnapDialogParams = {
    type: 'Confirmation',
    content: panel([
      heading('Remove specific Verifiable Credentials'),
      text('Would you like to remove the following VC IDs?'),
      divider(),
      text(JSON.stringify(id)),
    ]),
  };

  if (await snapDialog(snap, dialogParams)) {
    // Remove the specified Verifiable Credentials from the store based on their IDs
    const accountState = await getAccountStateByCoinType(
      state,
      account.evmAddress,
    );
    return Promise.all(
      ids.map(async (_id: string) => {
        return await agent.deleteVC({
          id: _id,
          options: optionsFiltered,
          accessToken: accountState.accountConfig.identity.googleAccessToken,
        });
      }),
    ).then((data: IDataManagerDeleteResult[][]) => {
      return data.flat();
    });
  }
  throw new Error('User rejected');
}
