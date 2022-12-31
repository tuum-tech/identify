import { SnapProvider } from '@metamask/snap-types';
import {
  IIdentifier,
  MinimalImportableKey,
  VerifiableCredential,
  VerifiablePresentation,
} from '@veramo/core';
import { ExampleVCValue, IdentitySnapState, VCQuery } from '../interfaces';
import { getAgent } from '../veramo/setup';
import { getHederaChainIDs } from './config';
import { getCurrentDid } from './didUtils';
import { getCurrentNetwork, snapConfirm } from './snapUtils';

/* eslint-disable */
export async function veramoCreateExampleVC(
  wallet: SnapProvider,
  state: IdentitySnapState,
  exampleVCData: ExampleVCValue
): Promise<boolean> {
  // GET DID
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
  console.log('Created vc: ', JSON.stringify(vc, null, 4));
  return await agent.saveVC({ store: "snap", vc });
}

export async function veramoSaveVC(
  wallet: SnapProvider,
  state: IdentitySnapState,
  vc: VerifiableCredential,
): Promise<boolean> {
  const agent = await getAgent(wallet, state);
  return await agent.saveVC({ store: "snap", vc });
}

export async function veramoListVCs(
  wallet: SnapProvider,
  state: IdentitySnapState,
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
  const did = await veramoImportMetaMaskAccount(wallet, state);
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
      console.log('DID');
      console.log(did);

      const vp = await agent.createVerifiablePresentation({
        presentation: {
          holder: did,
          type: ['VerifiablePresentation', 'Custom'],
          verifiableCredential: [vc.vc],
        },
        challenge,
        domain,
        proofFormat: 'jwt',
        // proofFormat: 'EthereumEip712Signature2021',
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

  let controllerKeyId = `metamask-${state.currentAccount}`;

  const chain_id = await getCurrentNetwork(wallet);
  const hederaChainIDs = getHederaChainIDs();
  if (
    Array.from(hederaChainIDs.keys()).includes(chain_id)
  ) {
    controllerKeyId = `metamask-${state.hederaAccount.accountId}`
    await agent.didManagerImport({
      did,
      provider: method,
      controllerKeyId,
      keys: [
        {
          kid: controllerKeyId,
          type: 'Secp256k1',
          kms: 'snap',
          privateKeyHex: state.hederaAccount.privateKey,
          publicKeyHex: state.hederaAccount.publicKey,
        } as MinimalImportableKey,
      ],
    });

  } else {
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
            algorithms: ["ES256K", "ES256K-R", "eth_signTransaction", "eth_signTypedData", "eth_signMessage", "eth_rawSign"]
          },
        } as MinimalImportableKey,
      ],
    });
  }
  console.log(
    `Importing using did=${did}, provider=${method}, controllerKeyId=${controllerKeyId}...`
  );

  console.log('imported successfully');
  return did;
}
