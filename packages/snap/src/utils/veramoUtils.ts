/* eslint-disable */


import { SnapProvider } from '@metamask/snap-types';
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
  W3CVerifiableCredential
} from '@veramo/core';
import cloneDeep from 'lodash.clonedeep';
import { validHederaChainID } from '../hedera/config';
import { IdentitySnapState } from '../interfaces';
import { KeyPair } from '../types/crypto';
import { CreateVPRequestParams, GetVCsOptions } from '../types/params';
import {
  Filter,
  IDataManager,
  IDataManagerClearResult,
  IDataManagerDeleteResult,
  IDataManagerQueryResult,
  IDataManagerSaveResult
} from '../veramo/plugins/verfiable-creds-manager';
import { getAgent } from '../veramo/setup';
import { getCurrentDid } from './didUtils';
import { getKeyPair } from './hederaUtils';
import { getCurrentNetwork, snapConfirm } from './snapUtils';

/* eslint-disable */
export async function veramoResolveDID(
  wallet: SnapProvider,
  state: IdentitySnapState,
  didUrl?: string
): Promise<DIDResolutionResult> {
  let did = didUrl;
  // Get agent
  const agent = await getAgent(wallet, state);

  
  const keyPair = await getKeyPairFromAgent(wallet, state, agent);


  // GET DID if not exists
  if (!did) {
    did = await veramoImportMetaMaskAccount(wallet, state, keyPair);
  }
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
  credTypes: string[]
): Promise<IDataManagerSaveResult[]> {
  const agent = await getAgent(wallet, state);
  const keyPair = await getKeyPairFromAgent(wallet, state, agent);
  // GET DID
  const did = await veramoImportMetaMaskAccount(wallet, state, keyPair);

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
  const chainId = await getCurrentNetwork(wallet);
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
  wallet: SnapProvider,
  state: IdentitySnapState,
  store: string | string[]
): Promise<IDataManagerClearResult[]> {
  const agent = await getAgent(wallet, state);
  let options: any = undefined;
  if (store) options = { store };

  return await agent.clear({
    options,
  });
}

export async function veramoCreateVP(
  wallet: SnapProvider,
  state: IdentitySnapState,
  params: CreateVPRequestParams
): Promise<VerifiablePresentation | null> {
  const vcsMetadata = params.vcs;
  const proofFormat = params.proofInfo?.proofFormat
    ? params.proofInfo.proofFormat
    : ('jwt' as ProofFormat);
  const type = params.proofInfo?.type ? params.proofInfo.type : 'Custom';
  const domain = params.proofInfo?.domain;
  const challenge = params.proofInfo?.challenge;

  //Get Veramo agent
  const agent = await getAgent(wallet, state);

  //GET DID
  const keyPair = await getKeyPairFromAgent(wallet, state, agent);
  const did = await veramoImportMetaMaskAccount(wallet, state, keyPair);

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

  if (config.dApp.disablePopups || (await snapConfirm(wallet, promptObj))) {
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
  } else {
      throw new Error('User rejected');
  }
}

export async function veramoVerifyVP(
  wallet: SnapProvider,
  state: IdentitySnapState,
  vp: VerifiablePresentation
): Promise<IVerifyResult> {
  const agent = await getAgent(wallet, state);
  return await agent.verifyPresentation({ presentation: vp });
}

export async function getKeyPairFromAgent(
  wallet: SnapProvider,
  state: IdentitySnapState,
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
  const controllerKeyId = `metamask-${state.currentAccount}`;
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
  wallet: SnapProvider,
  state: IdentitySnapState,
  keyPair: KeyPair
): Promise<string> {
  const agent = await getAgent(wallet, state);
  const method =
    state.accountState[state.currentAccount].accountConfig.identity.didMethod;
  const did = await getCurrentDid(wallet, state);

  console.log("current did " + did );
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
