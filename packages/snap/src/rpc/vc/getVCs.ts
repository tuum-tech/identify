import { IdentitySnapParams, SnapDialogParams } from '../../interfaces';
import { IDataManagerQueryResult } from '../../plugins/veramo/verfiable-creds-manager';
import { generateVCPanel, snapDialog } from '../../snap/dialog';
import { GetVCsRequestParams } from '../../types/params';
import { VeramoAgent } from '../../veramo/agent';

/**
 * Function to get VCs.
 *
 * @param identitySnapParams - Identity snap params.
 * @param vcRequestParams - VC request params.
 */
export async function getVCs(
  identitySnapParams: IdentitySnapParams,
  vcRequestParams: GetVCsRequestParams,
): Promise<IDataManagerQueryResult[]> {
  const { snap, state } = identitySnapParams;

  const { filter, options } = vcRequestParams || {};
  const { store = 'snap', returnStore = true } = options || {};

  // Get Veramo agent
  const agent = new VeramoAgent(identitySnapParams);
  const vcs = await agent.getVCs({ store, returnStore }, filter);

  console.log('VCs: ', JSON.stringify(vcs, null, 4));

  const header = 'Retrieve Verifiable Credentials';
  const prompt = 'Are you sure you want to send VCs to the dApp?';
  const description = `Some dApps are less secure than others and could save data from VCs against your will. Be careful where you send your private VCs! Number of VCs submitted is ${vcs.length.toString()}`;
  const dialogParams: SnapDialogParams = {
    type: 'Confirmation',
    content: await generateVCPanel(header, prompt, description, vcs),
  };

  if (
    state.snapConfig.dApp.disablePopups ||
    (await snapDialog(snap, dialogParams))
  ) {
    return vcs;
  }

  return [];
}
