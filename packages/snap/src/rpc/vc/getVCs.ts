import { divider, heading, panel, text } from '@metamask/snaps-ui';
import { VerifiableCredential } from '@veramo/core';
import { IDataManagerQueryResult } from 'src/veramo/plugins/verfiable-creds-manager';
import { IdentitySnapParams, SnapDialogParams } from '../../interfaces';
import { GetVCsRequestParams } from '../../types/params';
import { snapDialog } from '../../utils/snapUtils';
import { veramoGetVCs } from '../../utils/veramoUtils';

/* eslint-disable */
export async function getVCs(
  identitySnapParams: IdentitySnapParams,
  vcRequestParams: GetVCsRequestParams
): Promise<IDataManagerQueryResult[]> {
  const { snap, state, metamask } = identitySnapParams;

  const { filter, options } = vcRequestParams || {};
  const { store = 'snap', returnStore = true } = options || {};

  const vcs = await veramoGetVCs(snap, { store, returnStore }, filter);

  console.log('VCs: ', JSON.stringify(vcs, null, 4));
  const panelToShow = [
    heading('Retrieve Verifiable Credentials'),
    text('Are you sure you want to send VCs to the dApp?'),
    divider(),
    text(
      `Some dApps are less secure than others and could save data from VCs against your will. Be careful where you send your private VCs! Number of VCs submitted is ${vcs.length.toString()}`
    ),
  ];
  vcs.forEach((vc, index) => {
    const vcData = vc.data as VerifiableCredential;
    const vcsToShow = {
      credentialSubject: vcData.credentialSubject,
      type: vcData.type,
      metadata: vc.metadata,
    };
    panelToShow.push(divider());
    panelToShow.push(text(`Credential #${index + 1}`));
    panelToShow.push(divider());
    panelToShow.push(text(JSON.stringify(vcsToShow)));
  });
  const dialogParams: SnapDialogParams = {
    type: 'Confirmation',
    content: panel(panelToShow),
  };

  if (
    state.snapConfig.dApp.disablePopups ||
    (await snapDialog(snap, dialogParams))
  ) {
    return vcs;
  }

  return [];
}
