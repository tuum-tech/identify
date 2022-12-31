import { SnapProvider } from '@metamask/snap-types';
import { VerifiableCredential } from '@veramo/core';
import { IdentitySnapState, VCQuery } from '../../interfaces';
import { snapConfirm } from '../../utils/snapUtils';
import { veramoListVCs } from '../../utils/veramoUtils';

/* eslint-disable */
export async function getVCs(
  wallet: SnapProvider,
  state: IdentitySnapState,
  query?: VCQuery
): Promise<VerifiableCredential[]> {
  console.log('query', query);
  const vcs = await veramoListVCs(
    wallet,
    state,
    query
  );
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
