import { divider, heading, panel, text } from '@metamask/snaps-ui';
import { IDataManagerDeleteResult } from 'src/veramo/plugins/verfiable-creds-manager';
import { IdentitySnapParams, SnapDialogParams } from '../../interfaces';
import { RemoveVCsRequestParams } from '../../types/params';
import { veramoRemoveVC } from '../../utils/veramoUtils';
import { snapDialog } from '../snap/utils';

/**
 * Function to remove VC.
 *
 * @param identitySnapParams - Identity snap params.
 * @param vcRequestParams - VC request params.
 */
export async function removeVC(
  identitySnapParams: IdentitySnapParams,
  vcRequestParams: RemoveVCsRequestParams,
): Promise<IDataManagerDeleteResult[] | null> {
  const { snap } = identitySnapParams;

  const { id = '', options } = vcRequestParams || {};
  const { store = 'snap' } = options || {};

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
    return await veramoRemoveVC(snap, ids, store);
  }
  throw new Error('User rejected');
}
