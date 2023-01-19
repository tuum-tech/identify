import { SnapProvider } from '@metamask/snap-types';
import {
  DIDResolutionResult,
  IIdentifier,
  IVerifyResult,
  MinimalImportableKey,
  VerifiablePresentation,
  W3CVerifiableCredential,
} from '@veramo/core';
import { IdentitySnapState } from '../interfaces';
import { CreateVPRequestParams, GetVCsOptions } from '../types/params';
import { GetVCsRequestResult } from '../types/results';
import {
  Filter,
  IDataManagerSaveResult,
} from '../veramo/plugins/verfiable-creds-manager';
import { getAgent } from '../veramo/setup';
import { getHederaChainIDs } from './config';
import { getCurrentDid } from './didUtils';
import { getCurrentNetwork, snapConfirm } from './snapUtils';

/* eslint-disable */
export async function veramoResolveDID(
  wallet: SnapProvider,
  state: IdentitySnapState,
  didUrl?: string
): Promise<DIDResolutionResult> {
  let did = didUrl;
  // GET DID if not exists
  if (!did) {
    did = await veramoImportMetaMaskAccount(wallet, state);
  }
  const agent = await getAgent(wallet, state);
  return await agent.resolveDid({
    didUrl: did,
  });
}

export async function veramoGetVCs(
  wallet: SnapProvider,
  state: IdentitySnapState,
  options: GetVCsOptions,
  filter?: Filter
): Promise<GetVCsRequestResult[]> {
  const agent = await getAgent(wallet, state);
  const result = (await agent.query({
    filter,
    options,
  })) as GetVCsRequestResult[];
  return result;
}

export async function veramoSaveVC(
  wallet: SnapProvider,
  state: IdentitySnapState,
  verifiableCredential: W3CVerifiableCredential,
  store: string | string[]
): Promise<IDataManagerSaveResult[]> {
  const agent = await getAgent(wallet, state);
  const result = await agent.save({
    data: verifiableCredential,
    options: { store },
  });
  return result;
}

export async function veramoCreateVC(
  wallet: SnapProvider,
  state: IdentitySnapState,
  vcKey: string,
  vcValue: object,
  store: string | string[],
  credTypes?: string[]
): Promise<IDataManagerSaveResult[]> {
  // GET DID
  const did = await veramoImportMetaMaskAccount(wallet, state);
  const agent = await getAgent(wallet, state);
  const verifiableCredential = await agent.createVerifiableCredential({
    credential: {
      issuer: { id: did },
      issuanceDate: new Date().toISOString(),
      credentialSubject: {
        id: did,
        [vcKey]: vcValue,
      },
      type: credTypes,
    },
    proofFormat: 'jwt',
  });
  console.log(
    'Created verifiableCredential: ',
    JSON.stringify(verifiableCredential, null, 4)
  );
  const result = await agent.save({
    data: verifiableCredential,
    options: { store },
  });
  return result;
}

export async function veramoVerifyVC(
  wallet: SnapProvider,
  state: IdentitySnapState,
  vc: W3CVerifiableCredential
): Promise<IVerifyResult> {
  const agent = await getAgent(wallet, state);
  return await agent.verifyCredential({ credential: vc });
}

export async function veramoCreateVP(
  wallet: SnapProvider,
  state: IdentitySnapState,
  params: CreateVPRequestParams
): Promise<VerifiablePresentation | null> {
  const vcsMetadata = params.vcs;
  const proofFormat = params.proofInfo?.proofFormat
    ? params.proofInfo.proofFormat
    : 'jwt';
  const type = params.proofInfo?.type ? params.proofInfo.type : 'Custom';
  const domain = params.proofInfo?.domain;
  const challenge = params.proofInfo?.challenge;

  //GET DID
  const did = await veramoImportMetaMaskAccount(wallet, state);
  //Get Veramo agent
  const agent = await getAgent(wallet, state);

  const vcs: W3CVerifiableCredential[] = [];

  for (const vcId of vcsMetadata) {
    const vcObj = (await agent.query({
      filter: {
        type: 'id',
        filter: vcId,
      },
      options: { store: 'snap' },
    })) as GetVCsRequestResult[];
    if (vcObj.length > 0) {
      const vc: W3CVerifiableCredential = vcObj[0].data;
      vcs.push(vc);
    }
  }

  if (vcs.length === 0) return null;
  const config = state.snapConfig;
  const promptObj = {
    prompt: 'Alert',
    description: 'Do you wish to create a VP from the following VC?',
    textAreaContent: 'Multiple VCs',
  };
  if (config.dApp.disablePopups || (await snapConfirm(wallet, promptObj))) {
    const vp = await agent.createVerifiablePresentation({
      presentation: {
        holder: did,
        type: ['VerifiablePresentation', type],
        verifiableCredential: vcs,
      },
      proofFormat: proofFormat,
      domain: domain,
      challenge: challenge,
    });
    return vp;
  }
  console.log('No VCs found...');
  return null;
}

export async function veramoVerifyVP(
  wallet: SnapProvider,
  state: IdentitySnapState,
  vp: VerifiablePresentation
): Promise<IVerifyResult> {
  const agent = await getAgent(wallet, state);
  return await agent.verifyPresentation({ presentation: vp });
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
  if (Array.from(hederaChainIDs.keys()).includes(chain_id)) {
    controllerKeyId = `metamask-${state.hederaAccount.accountId}`;
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
            algorithms: [
              'ES256K',
              'ES256K-R',
              'eth_signTransaction',
              'eth_signTypedData',
              'eth_signMessage',
              'eth_rawSign',
            ],
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
