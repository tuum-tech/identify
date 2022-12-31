import { SnapProvider } from '@metamask/snap-types';
import {
  IIdentifier,
  MinimalImportableKey,
  VerifiableCredential,
  VerifiablePresentation,
} from '@veramo/core';
import { ExampleVCValue, IdentitySnapState, VCQuery } from '../interfaces';
import { availableVCStores } from '../veramo/plugins/availableVCStores';
import { getAgent } from '../veramo/setup';
import { getCurrentDid } from './didUtils';
import { snapConfirm } from './snapUtils';

/* eslint-disable */
export async function veramoCreateExampleVC(
  wallet: SnapProvider,
  state: IdentitySnapState,
  vcStore: typeof availableVCStores[number],
  exampleVCData: ExampleVCValue
): Promise<boolean> {
  //GET DID
  const did = await veramoImportMetaMaskAccount(wallet, state);

  const agent = await getAgent(wallet, state);
  const vc = await agent.createVerifiableCredential({
    credential: {
      issuer: { id: did },
      issuanceDate: new Date().toISOString(),
      credentialSubject: {
        id: did,
        exampleVC: {
          id: did,
          name: exampleVCData.name,
          value: exampleVCData.value,
        },
      },
    },
    proofFormat: 'jwt',
  });
  console.log('created vc: ', JSON.stringify(vc));
  return await agent.saveVC({ store: vcStore, vc });
}

export async function veramoSaveVC(
  wallet: SnapProvider,
  state: IdentitySnapState,
  vc: VerifiableCredential,
  vcStore: typeof availableVCStores[number]
): Promise<boolean> {
  const agent = await getAgent(wallet, state);
  return await agent.saveVC({ store: vcStore, vc });
}

export async function veramoListVCs(
  wallet: SnapProvider,
  state: IdentitySnapState,
  vcStore: typeof availableVCStores[number], // This is always going to be 'snap' for now
  query?: VCQuery
): Promise<VerifiableCredential[]> {
  const agent = await getAgent(wallet, state);
  const vcsSnap = await agent.listVCS({ store: 'snap', query: query });
  return vcsSnap.vcs;
}

export async function veramoCreateVP(
  wallet: SnapProvider,
  state: IdentitySnapState,
  vcId: string,
  challenge?: string,
  domain?: string
): Promise<VerifiablePresentation | null> {
  //GET DID
  const identifier = await veramoImportMetaMaskAccount(wallet, state);
  console.log('Identifier: ', identifier);
  //Get Veramo agent
  const agent = await getAgent(wallet, state);
  let vc;
  try {
    // FIXME: getVC should return null not throw an error
    vc = await agent.getVC({ store: 'snap', id: vcId });
  } catch (e) {
    throw new Error('VC not found');
  }
  const config = state.snapConfig;
  console.log(vcId, domain, challenge);
  if (vc && vc.vc) {
    const promptObj = {
      prompt: 'Alert',
      description: 'Do you wish to create a VP from the following VC?',
      textAreaContent: JSON.stringify(vc.vc.credentialSubject),
    };

    if (config.dApp.disablePopups || (await snapConfirm(wallet, promptObj))) {
      if (challenge) console.log('Challenge:', challenge);
      if (domain) console.log('Domain:', domain);
      console.log('Identifier');
      console.log(identifier);

      const vp = await agent.createVerifiablePresentation({
        presentation: {
          holder: identifier,
          type: ['VerifiablePresentation', 'Custom'],
          verifiableCredential: [vc.vc],
        },
        challenge,
        domain,
        proofFormat: 'EthereumEip712Signature2021',
        save: false,
      });
      console.log('....................VP..................');
      console.log(vp);
      return vp;
    }
    return null;
  }
  console.log('No VC found...');
  return null;
}

export async function veramoImportMetaMaskAccount(
  wallet: SnapProvider,
  state: IdentitySnapState
): Promise<string> {
  const agent = await getAgent(wallet, state);
  const method =
    state.accountState[state.currentAccount].accountConfig.identity.didMethod;
  const did = await getCurrentDid(wallet, state);
  const identifiers = await agent.didManagerFind();

  let exists = false;
  identifiers.forEach((id: IIdentifier) => {
    if (id.did === did) {
      exists = true;
    }
  });

  if (exists) {
    console.log('DID already exists', did);
    return did;
  }

  const controllerKeyId = `metamask-${state.currentAccount}`;
  console.log(
    `Importing using did=${did}, provider=${method}, controllerKeyId=${controllerKeyId}...`
  );
  await agent.didManagerImport({
    did,
    provider: method,
    controllerKeyId,
    keys: [
      {
        kid: controllerKeyId,
        type: 'Secp256k1',
        kms: 'web3',
        privateKeyHex: '',
        publicKeyHex: '',
        meta: {
          provider: 'metamask',
          account: state.currentAccount.toLowerCase(),
          algorithms: ['eth_sign'],
        },
      } as MinimalImportableKey,
    ],
  });

  console.log('imported successfully');
  return did;
}
