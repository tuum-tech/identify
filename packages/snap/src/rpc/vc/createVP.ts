import {
  MinimalImportableKey,
  ProofFormat,
  VerifiableCredential,
  VerifiablePresentation,
} from '@veramo/core';
import { IdentitySnapParams, SnapDialogParams } from '../../interfaces';
import {
  IDataManagerQueryResult,
  QueryOptions,
} from '../../plugins/veramo/verfiable-creds-manager';
import { generateVCPanel, snapDialog } from '../../snap/dialog';
import { CreateVPRequestParams } from '../../types/params';
import { getVeramoAgent } from '../../veramo/agent';

/**
 * Function to create verifiable presentation.
 *
 * @param identitySnapParams - Identity snap params.
 * @param vpRequestParams - VP request params.
 */
export async function createVP(
  identitySnapParams: IdentitySnapParams,
  vpRequestParams: CreateVPRequestParams,
): Promise<VerifiablePresentation | null> {
  const { snap, state, account } = identitySnapParams;

  const vcsMetadata = vpRequestParams.vcs;

  console.log(`vcs metadata ${JSON.stringify(vcsMetadata)}`);
  const proofFormat = vpRequestParams.proofInfo?.proofFormat
    ? vpRequestParams.proofInfo.proofFormat
    : ('jwt' as ProofFormat);
  const type = vpRequestParams.proofInfo?.type
    ? vpRequestParams.proofInfo.type
    : 'Custom';
  const domain = vpRequestParams.proofInfo?.domain;
  const challenge = vpRequestParams.proofInfo?.challenge;

  // Get Veramo agent
  const agent = await getVeramoAgent(snap, state);

  const identifier = await agent.didManagerImport({
    did: account.identifier.did,
    provider: account.method,
    controllerKeyId: account.identifier.controllerKeyId,
    keys: [
      {
        kid: account.identifier.controllerKeyId,
        type: 'Secp256k1',
        kms: 'snap',
        privateKeyHex: account.privateKey,
        publicKeyHex: account.publicKey,
      } as MinimalImportableKey,
    ],
  });

  // GET DID
  const { did } = identifier;

  const vcs: VerifiableCredential[] = [];
  const vcsWithMetadata: IDataManagerQueryResult[] = [];

  for (const vcId of vcsMetadata) {
    const vcObj = (await agent.queryVC({
      filter: {
        type: 'id',
        filter: vcId,
      },
      options: { store: 'snap' } as QueryOptions,
    })) as IDataManagerQueryResult[];

    if (vcObj.length > 0) {
      const vc: VerifiableCredential = vcObj[0].data as VerifiableCredential;
      vcs.push(vc);
      vcsWithMetadata.push({
        data: vc,
        metadata: { id: vcId, store: 'snap' },
      });
    }
  }

  if (vcs.length === 0) {
    console.log('here');
    return null;
  }
  const config = state.snapConfig;

  const header = 'Create Verifiable Presentation';
  const prompt = 'Do you wish to create a VP from the following VCs?';
  const description =
    'A Verifiable Presentation is a secure way for someone to present information about themselves or their identity to someone else while ensuring that the information is accureate and trustworthy';
  const dialogParams: SnapDialogParams = {
    type: 'Confirmation',
    content: await generateVCPanel(
      header,
      prompt,
      description,
      vcsWithMetadata,
    ),
  };
  if (config.dApp.disablePopups || (await snapDialog(snap, dialogParams))) {
    // Generate a Verifiable Presentation from VCs
    const vp = await agent.createVerifiablePresentation({
      presentation: {
        holder: did, //
        type: ['VerifiablePresentation', type],
        verifiableCredential: vcs,
      },
      proofFormat, // The desired format for the VerifiablePresentation to be created
      domain, // Optional string domain parameter to add to the verifiable presentation
      challenge, // Optional (only JWT) string challenge parameter to add to the verifiable presentation
    });
    return vp;
  }
  throw new Error('User rejected');
}
