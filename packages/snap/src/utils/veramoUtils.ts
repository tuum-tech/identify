import { MetaMaskInpageProvider } from '@metamask/providers';
import { SnapsGlobalObject } from '@metamask/snaps-types';
import {
  DIDResolutionResult,
  ICredentialIssuer,
  IDataStore,
  IDIDManager,
  IIdentifier,
  IKeyManager,
  IResolver,
  IVerifyResult,
  MinimalImportableKey,
  ProofFormat,
  TAgent,
  VerifiablePresentation,
  W3CVerifiableCredential,
} from '@veramo/core';
import cloneDeep from 'lodash.clonedeep';
import { validHederaChainID } from '../hedera/config';
import { IdentitySnapParams } from '../interfaces';
import { KeyPair } from '../types/crypto';
import { CreateVPRequestParams, GetVCsOptions } from '../types/params';
import {
  Filter,
  IDataManager,
  IDataManagerClearResult,
  IDataManagerDeleteResult,
  IDataManagerQueryResult,
  IDataManagerSaveResult,
} from '../veramo/plugins/verfiable-creds-manager';
import { getAgent } from '../veramo/setup';
import { getCurrentDid } from './didUtils';
import { getKeyPair } from './hederaUtils';
import { getCurrentNetwork, snapConfirm } from './snapUtils';

/* eslint-disable */
export async function veramoResolveDID(
  params: IdentitySnapParams,
  didUrl?: string
): Promise<DIDResolutionResult> {
  const { snap, state, metamask } = params;
  let did = didUrl;

  // Get agent
  const agent = await getAgent(snap, metamask);
  const keyPair = await getKeyPairFromAgent(state.currentAccount, agent);

  // GET DID if not exists
  if (!did) {
    did = await veramoImportMetaMaskAccount(params, keyPair);
  }
  return await agent.resolveDid({
    didUrl: did,
  });
}

export async function veramoGetVCs(
  snap: SnapsGlobalObject,
  metamask: MetaMaskInpageProvider,
  options: GetVCsOptions,
  filter?: Filter
): Promise<IDataManagerQueryResult[]> {
  const agent = await getAgent(snap, metamask);
  const result = (await agent.query({
    filter,
    options,
  })) as IDataManagerQueryResult[];
  return result;
}

export async function veramoSaveVC(
  snap: SnapsGlobalObject,
  metamask: MetaMaskInpageProvider,
  verifiableCredential: W3CVerifiableCredential,
  store: string | string[]
): Promise<IDataManagerSaveResult[]> {
  const agent = await getAgent(snap, metamask);
  const result = await agent.save({
    data: verifiableCredential,
    options: { store },
  });
  return result;
}

export async function veramoCreateVC(
  params: IdentitySnapParams,
  vcKey: string,
  vcValue: object,
  store: string | string[],
  credTypes: string[]
): Promise<IDataManagerSaveResult[]> {
  const { snap, state, metamask } = params;

  const agent = await getAgent(snap, metamask);
  const keyPair = await getKeyPairFromAgent(state.currentAccount, agent);
  // GET DID
  const did = await veramoImportMetaMaskAccount(params, keyPair);

  const issuanceDate = new Date();
  const expirationDate = cloneDeep(issuanceDate);
  expirationDate.setFullYear(
    issuanceDate.getFullYear() + 1,
    issuanceDate.getMonth(),
    issuanceDate.getDate()
  );

  const credential = new Map<string, unknown>();
  credential.set('issuanceDate', issuanceDate.toISOString()); // the entity that issued the credential+
  credential.set('expirationDate', expirationDate.toISOString()); // when the credential was issued
  credential.set('type', credTypes);

  let issuer: { id: string; hederaAccountId?: string } = { id: did };
  let credentialSubject: { id: string; hederaAccountId?: string } = {
    id: did, // identifier for the only subject of the credential
    [vcKey]: vcValue, // assertion about the only subject of the credential
  };
  const chainId = await getCurrentNetwork(metamask);
  if (validHederaChainID(chainId)) {
    const hederaAccountId =
      state.accountState[state.currentAccount].hederaAccount.accountId;
    issuer.hederaAccountId = hederaAccountId;
    credentialSubject.hederaAccountId = hederaAccountId;
  }
  credential.set('issuer', issuer); // the entity that issued the credential
  credential.set('credentialSubject', credentialSubject);

  const verifiableCredential = await agent.createVerifiableCredential({
    credential: JSON.parse(JSON.stringify(Object.fromEntries(credential))),
    // digital proof that makes the credential tamper-evident
    proofFormat: 'jwt' as ProofFormat,
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
  snap: SnapsGlobalObject,
  metamask: MetaMaskInpageProvider,
  vc: W3CVerifiableCredential
): Promise<IVerifyResult> {
  const agent = await getAgent(snap, metamask);
  return await agent.verifyCredential({ credential: vc });
}

export async function veramoRemoveVC(
  snap: SnapsGlobalObject,
  metamask: MetaMaskInpageProvider,
  ids: string[],
  store: string | string[]
): Promise<IDataManagerDeleteResult[]> {
  const agent = await getAgent(snap, metamask);
  let options: any = undefined;
  if (store) options = { store };

  return Promise.all(
    ids.map(async (id) => {
      return await agent.delete({
        id,
        options,
      });
    })
  ).then((data: IDataManagerDeleteResult[][]) => {
    return data.flat();
  });
}

export async function veramoDeleteAllVCs(
  snap: SnapsGlobalObject,
  metamask: MetaMaskInpageProvider,
  store: string | string[]
): Promise<IDataManagerClearResult[]> {
  const agent = await getAgent(snap, metamask);
  let options: any = undefined;
  if (store) options = { store };

  return await agent.clear({
    options,
  });
}

export async function veramoCreateVP(
  identitySnapParams: IdentitySnapParams,
  vpRequestParams: CreateVPRequestParams
): Promise<VerifiablePresentation | null> {
  const { snap, state, metamask } = identitySnapParams;

  const vcsMetadata = vpRequestParams.vcs;
  const proofFormat = vpRequestParams.proofInfo?.proofFormat
    ? vpRequestParams.proofInfo.proofFormat
    : ('jwt' as ProofFormat);
  const type = vpRequestParams.proofInfo?.type
    ? vpRequestParams.proofInfo.type
    : 'Custom';
  const domain = vpRequestParams.proofInfo?.domain;
  const challenge = vpRequestParams.proofInfo?.challenge;

  //Get Veramo agent
  const agent = await getAgent(snap, metamask);

  //GET DID
  const keyPair = await getKeyPairFromAgent(state.currentAccount, agent);
  const did = await veramoImportMetaMaskAccount(identitySnapParams, keyPair);

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
    description: 'Do you wish to create a VP from the following VC IDs?',
    textAreaContent: JSON.stringify(vcsMetadata),
  };

  if (config.dApp.disablePopups || (await snapConfirm(snap, promptObj))) {
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
  console.log('No VCs found...');
  return null;
}

export async function veramoVerifyVP(
  snap: SnapsGlobalObject,
  metamask: MetaMaskInpageProvider,
  vp: VerifiablePresentation
): Promise<IVerifyResult> {
  const agent = await getAgent(snap, metamask);
  return await agent.verifyPresentation({ presentation: vp });
}

export async function getKeyPairFromAgent(
  account: string,
  agent: TAgent<
    IKeyManager &
      IDIDManager &
      IResolver &
      IDataManager &
      ICredentialIssuer &
      IDataStore
  >
): Promise<KeyPair> {
  let keyPair = {} as KeyPair;
  const controllerKeyId = `metamask-${account}`;
  try {
    const privateKey = (await agent.keyManagerGet({ kid: controllerKeyId }))
      .privateKeyHex;
    if (privateKey !== undefined) {
      keyPair = await getKeyPair(privateKey);
    }
  } catch (error) {
    console.log(`Error: ${error}`);
  }
  return keyPair;
}

export async function veramoImportMetaMaskAccount(
  params: IdentitySnapParams,
  keyPair: KeyPair
): Promise<string> {
  const { snap, state, metamask, bip44CoinTypeNode } = params;
  const agent = await getAgent(snap, metamask);
  const method =
    state.accountState[state.currentAccount].accountConfig.identity.didMethod;
  const did = await getCurrentDid(state, metamask);
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
  await agent.didManagerImport({
    did,
    provider: method,
    controllerKeyId,
    keys: [
      {
        kid: controllerKeyId,
        type: 'Secp256k1',
        kms: 'snap',
        privateKeyHex: keyPair.privateKey,
        publicKeyHex: keyPair.publicKey,
      } as MinimalImportableKey,
    ],
  });
  console.log(
    `Importing using did=${did}, provider=${method}, controllerKeyId=${controllerKeyId}...`
  );

  console.log('imported successfully');
  return did;
}
