import { SnapProvider } from '@metamask/snap-types';
import { IdentitySnapState } from '../../interfaces';
import { GetVCsRequestParams } from '../../types/params';
import { GetVCsRequestResult } from '../../types/results';
import { snapConfirm } from '../../utils/snapUtils';
import { veramoGetVCs } from '../../utils/veramoUtils';

/* eslint-disable */
export async function getVCs(
  wallet: SnapProvider,
  state: IdentitySnapState,
  params: GetVCsRequestParams
): Promise<GetVCsRequestResult[]> {
  const { filter, options } = params || {};
  const { store = 'snap', returnStore = true } = options || {};

  const vcs = await veramoGetVCs(wallet, state, { store, returnStore }, filter);

  console.log('VCs: ', JSON.stringify(vcs, null, 4));
  const promptObj = {
    prompt: 'Send VCs',
    description: 'Are you sure you want to send VCs to the dApp?',
    textAreaContent: `Some dApps are less secure than others and could save data from VCs against your will. Be careful where you send your private VCs! Number of VCs submitted is ${vcs.length.toString()}`,
  };

  if (
    state.snapConfig.dApp.disablePopups ||
    (await snapConfirm(wallet, promptObj))
  ) {
    return vcs;
  }

  return [];
}
