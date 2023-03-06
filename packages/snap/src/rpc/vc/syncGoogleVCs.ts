import { W3CVerifiableCredential } from '@veramo/core';
import { IdentitySnapParams, SnapDialogParams } from '../../interfaces';
import { verifyToken } from '../../plugins/veramo/google-drive-data-store';
import {
  IDataManagerQueryResult,
  IDataManagerSaveResult,
} from '../../plugins/veramo/verfiable-creds-manager';
import { generateVCPanel, snapDialog } from '../../snap/dialog';
import { VeramoAgent } from '../../veramo/agent';

/**
 * Function to sync Google VCs with snap.
 *
 * @param identitySnapParams - Identity snap params.
 */
export async function syncGoogleVCs(
  identitySnapParams: IdentitySnapParams,
): Promise<boolean> {
  const { state } = identitySnapParams;
  await verifyToken(
    state.accountState[state.currentAccount].accountConfig.identity
      .googleAccessToken,
  );
  // Get Veramo agent
  const agent = new VeramoAgent(identitySnapParams);

  const snapVCs = await agent.getVCs(
    { store: 'snap', returnStore: true },
    undefined,
  );
  const googleVCs = await agent.getVCs(
    { store: 'googleDrive', returnStore: true },
    undefined,
  );

  const snapVCIds = snapVCs.map((vc) => vc.metadata.id);
  const googleVCIds = googleVCs.map((vc) => vc.metadata.id);

  const vcsNotInSnap = googleVCs.filter(
    (vc) => !snapVCIds.includes(vc.metadata.id),
  );
  console.log('vcsNotInSnap: ', JSON.stringify(vcsNotInSnap, null, 4));

  const vcsNotInGDrive = snapVCs.filter(
    (vc) => !googleVCIds.includes(vc.metadata.id),
  );
  console.log('vcsNotInGDrive: ', JSON.stringify(vcsNotInGDrive, null, 4));

  const header = 'Sync Verifiable Credentials';
  let vcsNotInSnapSync = true;
  if (vcsNotInSnap.length > 0) {
    vcsNotInSnapSync = await handleSync(
      agent,
      `${header} - Import VCs from Google drive`,
      'Would you like to sync VCs in Google drive with Metamask snap?',
      'This action will import the VCs that are in Google drive to the Metamask snap',
      vcsNotInSnap,
    );
  }
  let vcsNotInGDriveSync = false;
  if (vcsNotInGDrive.length > 0) {
    vcsNotInGDriveSync = await handleSync(
      agent,
      `${header} - Export VCs to Google drive`,
      'Would you like to sync VCs in Metamask snap with Google drive?',
      'This action will export the VCs that are in Metamask snap to Google drive',
      vcsNotInGDrive,
    );
  }

  if (vcsNotInSnapSync && vcsNotInGDriveSync) {
    return true;
  }

  console.log(
    'Could not sync Verifiable Credentials between the Metamask snap and Google drive properly. Please try again',
  );
  throw new Error(
    'Could not sync Verifiable Credentials between the Metamask snap and Google drive properly. Please try again',
  );
}

/**
 * Function to handle the snap dialog and import/export each VC.
 *
 * @param agent - Veramo agent.
 * @param header - Header text of the metamask dialog box(eg. 'Retrieve Verifiable Credentials').
 * @param prompt - Prompt text of the metamask dialog box(eg. 'Are you sure you want to send VCs to the dApp?').
 * @param description - Description text of the metamask dialog box(eg. 'Some dApps are less secure than others and could save data from VCs against your will. Be careful where you send your private VCs! Number of VCs submitted is 2').
 * @param vcs - The Verifiable Credentials to show on the metamask dialog box.
 */
async function handleSync(
  agent: VeramoAgent,
  header: string,
  prompt: string,
  description: string,
  vcs: IDataManagerQueryResult[],
): Promise<boolean> {
  const dialogParams: SnapDialogParams = {
    type: 'Confirmation',
    content: await generateVCPanel(header, prompt, description, vcs),
  };
  if (await snapDialog(snap, dialogParams)) {
    for (const vc of vcs) {
      const result = (await agent.saveVC(
        vc.data as W3CVerifiableCredential,
        'snap',
        vc.metadata.id,
      )) as IDataManagerSaveResult[];
      if (!(result.length > 0 && result[0].id !== '')) {
        console.log('Could not sync the vc: ', JSON.stringify(vc, null, 4));
        return false;
      }
    }
  }
  console.log('User rejected the sync operation');
  return false;
}
