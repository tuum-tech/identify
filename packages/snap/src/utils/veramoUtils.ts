import { SnapProvider } from '@metamask/snap-types';
import {
  DIDResolutionResult,
  IIdentifier,
  IVerifyResult,
  MinimalImportableKey,
  VerifiablePresentation,
  W3CVerifiableCredential,
} from '@veramo/core';
import cloneDeep from 'lodash.clonedeep';
import { IdentitySnapState } from '../interfaces';
import { CreateVPRequestParams, GetVCsOptions } from '../types/params';
import {
  Filter,
  IDataManagerDeleteResult,
  IDataManagerQueryResult,
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
): Promise<IDataManagerQueryResult[]> {
  const agent = await getAgent(wallet, state);
  const result = (await agent.query({
    filter,
    options,
  })) as IDataManagerQueryResult[];
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

  const issuanceDate = new Date();
  const expirationDate = cloneDeep(issuanceDate);
  expirationDate.setFullYear(
    issuanceDate.getFullYear() + 1,
    issuanceDate.getMonth(),
    issuanceDate.getDate()
  );
  const verifiableCredential = await agent.createVerifiableCredential({
    credential: {
      issuer: { id: did }, // the entity that issued the credential
      issuanceDate: issuanceDate.toISOString(), // when the credential was issued
      expirationDate: expirationDate.toISOString(), // when the credential will expire
      // claims about the subjects of the credential
      credentialSubject: {
        id: did, // identifier for the only subject of the credential
        [vcKey]: vcValue, // assertion about the only subject of the credential
      },
      type: credTypes,
    },
    // digital proof that makes the credential tamper-evident
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

export async function veramoRemoveVC(
  wallet: SnapProvider,
  state: IdentitySnapState,
  ids: string[],
  store: string | string[]
): Promise<IDataManagerDeleteResult[]> {
  const agent = await getAgent(wallet, state);
  let options: any = undefined;
  if (store) options = { store };

  console.log('ids: ', JSON.stringify(ids, null, 4));
  let result: IDataManagerDeleteResult[][] = [];
  ids.forEach(async (id) => {
    const r = await agent.delete({
      id,
      options,
    });
    result.push(r);
  });
  console.log('result: ', JSON.stringify(result, null, 4));
  return result.flat();
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
    })) as IDataManagerQueryResult[];
    if (vcObj.length > 0) {
      const vc: W3CVerifiableCredential = vcObj[0]
        .data as W3CVerifiableCredential;
      vcs.push(vc);
    }
  }

  if (vcs.length === 0) return null;
  const config = state.snapConfig;
  const promptObj = {
    prompt: 'Alert',
    description: 'Do you wish to create a VP from the following VCs?',
    textAreaContent: JSON.stringify(vcs),
  };

  if (config.dApp.disablePopups || (await snapConfirm(wallet, promptObj))) {
    const vp = await agent.createVerifiablePresentation({
      presentation: {
        holder: did, //
        type: ['VerifiablePresentation', type],
        verifiableCredential: vcs,
      },
      proofFormat: proofFormat, // The desired format for the VerifiablePresentation to be created
      domain: domain, // Optional string domain parameter to add to the verifiable presentation
      challenge: challenge, // Optional (only JWT) string challenge parameter to add to the verifiable presentation
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
