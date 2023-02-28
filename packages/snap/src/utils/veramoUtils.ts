/* eslint-disable */
import { BIP44CoinTypeNode } from '@metamask/key-tree';
import { SnapsGlobalObject } from '@metamask/snaps-types';
import {
  DIDResolutionResult,
  IIdentifier,
  IVerifyResult,
  MinimalImportableKey,
  ProofFormat,
  VerifiableCredential,
  VerifiablePresentation,
  W3CVerifiableCredential,
} from '@veramo/core';
import cloneDeep from 'lodash.clonedeep';
import { validHederaChainID } from '../hedera/config';
import { IdentitySnapParams, SnapDialogParams } from '../interfaces';
import { generateVCPanel } from '../rpc/snap/dialogUtils';
import { getCurrentNetwork, snapDialog } from '../rpc/snap/utils';
import { KeyPair } from '../types/crypto';
import { CreateVPRequestParams, GetVCsOptions } from '../types/params';
import {
  Filter,
  IDataManagerClearResult,
  IDataManagerDeleteResult,
  IDataManagerQueryResult,
  IDataManagerSaveResult,
} from '../veramo/plugins/verfiable-creds-manager';
import { Agent, getAgent } from '../veramo/setup';
import { getCurrentDid } from './didUtils';
import { getKeyPair } from './hederaUtils';
import { getAddressKeyDeriver, snapGetKeysFromAddress } from './keyPair';

/**
 * Veramo Resolves DID.
 *
 * @param identitySnapParams - Identity snap params.
 * @param didUrl - DID url.
 * @returns Resolution result.
 */
export async function veramoResolveDID(
  identitySnapParams: IdentitySnapParams,
  didUrl?: string,
): Promise<DIDResolutionResult> {
  const { snap } = identitySnapParams;
  let did = didUrl;

  // Get agent
  const agent = await getAgent(snap);

  // GET DID if not exists
  if (!did) {
    const identifier = await veramoImportMetaMaskAccount(
      identitySnapParams,
      agent,
    );
    did = identifier.did;
  }
  return await agent.resolveDid({
    didUrl: did,
  });
}

/**
 * Veramo Get VCs.
 *
 * @param identitySnapParams - Identity snap params.
 * @param options - Get VCs options.
 * @param filter - Filter parameters.
 * @returns VCs.
 */
export async function veramoGetVCs(
  identitySnapParams: IdentitySnapParams,
  options: GetVCsOptions,
  filter?: Filter,
): Promise<IDataManagerQueryResult[]> {
  const { snap, state } = identitySnapParams;
  const agent = await getAgent(snap);
  const result = (await agent.queryVC({
    filter,
    options,
    accessToken:
      state.accountState[state.currentAccount].accountConfig.identity
        .googleAccessToken,
  })) as IDataManagerQueryResult[];
  return result;
}

/**
 * Veramo Save VC.
 *
 * @param identitySnapParams - Identity snap params.
 * @param verifiableCredential - Verifiable Credential.
 * @param store - Store to save.
 * @returns Save result.
 */
export async function veramoSaveVC(
  identitySnapParams: IdentitySnapParams,
  verifiableCredential: W3CVerifiableCredential,
  store: string | string[],
): Promise<IDataManagerSaveResult[]> {
  const { snap, state } = identitySnapParams;
  const agent = await getAgent(snap);
  const result = await agent.saveVC({
    data: verifiableCredential,
    options: { store },
    accessToken:
      state.accountState[state.currentAccount].accountConfig.identity
        .googleAccessToken,
  });
  return result;
}

/**
 * Veramo Create VC.
 *
 * @param identitySnapParams - Identity snap params.
 * @param vcKey - VC key.
 * @param vcValue - VC value.
 * @param store - Store to save.
 * @param credTypes - Credential types.
 * @returns Save result.
 */
export async function veramoCreateVC(
  identitySnapParams: IdentitySnapParams,
  vcKey: string,
  vcValue: object,
  store: string | string[],
  credTypes: string[],
): Promise<IDataManagerSaveResult[]> {
  const { snap, state, metamask } = identitySnapParams;

  // Get agent
  const agent = await getAgent(snap);

  // GET DID
  const identifier = await veramoImportMetaMaskAccount(
    identitySnapParams,
    agent,
  );
  const { did } = identifier;

  const issuanceDate = new Date();
  // Set the expiration date to be 1 year from the date it's issued
  const expirationDate = cloneDeep(issuanceDate);
  expirationDate.setFullYear(
    issuanceDate.getFullYear() + 1,
    issuanceDate.getMonth(),
    issuanceDate.getDate(),
  );

  const credential = new Map<string, unknown>();
  credential.set('issuanceDate', issuanceDate.toISOString()); // the entity that issued the credential+
  credential.set('expirationDate', expirationDate.toISOString()); // when the credential was issued
  credential.set('type', credTypes);

  const issuer: { id: string; hederaAccountId?: string } = { id: did };
  const credentialSubject: { id: string; hederaAccountId?: string } = {
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

  const verifiableCredential: W3CVerifiableCredential =
    await agent.createVerifiableCredential({
      credential: JSON.parse(JSON.stringify(Object.fromEntries(credential))),
      // digital proof that makes the credential tamper-evident
      proofFormat: 'jwt' as ProofFormat,
    });

  console.log(
    'Created verifiableCredential: ',
    JSON.stringify(verifiableCredential, null, 4),
  );
  const result = await agent.saveVC({
    data: verifiableCredential,
    options: { store },
    accessToken:
      state.accountState[state.currentAccount].accountConfig.identity
        .googleAccessToken,
  });

  console.log('Savede verifiableCredential: ', JSON.stringify(result, null, 4));
  return result;
}

/**
 * Veramo verify vc.
 *
 * @param snap - Snap.
 * @param vc - Verifiable Credential.
 * @returns Verify result.
 */
export async function veramoVerifyVC(
  snap: SnapsGlobalObject,
  vc: W3CVerifiableCredential,
): Promise<IVerifyResult> {
  // Get agent
  const agent = await getAgent(snap);
  return await agent.verifyCredential({ credential: vc });
}

/**
 * Veramo remove vc.
 *
 * @param identitySnapParams - Identity snap params.
 * @param ids - Ids to remove.
 * @param store - Store to remove from.
 * @returns Delete result.
 */
export async function veramoRemoveVC(
  identitySnapParams: IdentitySnapParams,
  ids: string[],
  store: string | string[],
): Promise<IDataManagerDeleteResult[]> {
  const { snap, state } = identitySnapParams;
  const agent = await getAgent(snap);
  let options: any;
  if (store) {
    options = { store };
  }

  return Promise.all(
    ids.map(async (id) => {
      return await agent.deleteVC({
        id,
        options,
        accessToken:
          state.accountState[state.currentAccount].accountConfig.identity
            .googleAccessToken,
      });
    }),
  ).then((data: IDataManagerDeleteResult[][]) => {
    return data.flat();
  });
}

/**
 * Veramo Delete all VCs.
 *
 * @param identitySnapParams - Identity snap params.
 * @param store - Store to remove from.
 * @returns Clear result.
 */
export async function veramoDeleteAllVCs(
  identitySnapParams: IdentitySnapParams,
  store: string | string[],
): Promise<IDataManagerClearResult[]> {
  const { snap, state } = identitySnapParams;
  const agent = await getAgent(snap);
  let options: any;
  if (store) {
    options = { store };
  }

  return await agent.clearVCs({
    options,
    accessToken:
      state.accountState[state.currentAccount].accountConfig.identity
        .googleAccessToken,
  });
}

/**
 * Veramo Create VP.
 *
 * @param identitySnapParams - Identity snap params.
 * @param vpRequestParams - VP request params.
 * @returns Created VP.
 */
export async function veramoCreateVP(
  identitySnapParams: IdentitySnapParams,
  vpRequestParams: CreateVPRequestParams,
): Promise<VerifiablePresentation | null> {
  const { snap, state } = identitySnapParams;

  const vcsMetadata = vpRequestParams.vcs;
  const proofFormat = vpRequestParams.proofInfo?.proofFormat
    ? vpRequestParams.proofInfo.proofFormat
    : ('jwt' as ProofFormat);
  const type = vpRequestParams.proofInfo?.type
    ? vpRequestParams.proofInfo.type
    : 'Custom';
  const domain = vpRequestParams.proofInfo?.domain;
  const challenge = vpRequestParams.proofInfo?.challenge;

  // Get Veramo agent
  const agent = await getAgent(snap);

  // GET DID
  const identifier = await veramoImportMetaMaskAccount(
    identitySnapParams,
    agent,
  );
  const { did } = identifier;

  const vcs: VerifiableCredential[] = [];
  const vcsWithMetadata: IDataManagerQueryResult[] = [];

  for (const vcId of vcsMetadata) {
    const vcObj = (await agent.queryVC({
      filter: {
        type: 'id',
        filter: vcId,
      },
      options: { store: 'snap' },
    })) as IDataManagerQueryResult[];

    if (vcObj.length > 0) {
      const vc: VerifiableCredential = vcObj[0].data as VerifiableCredential;
      vcs.push(vc);
      vcsWithMetadata.push({ data: vc, metadata: { id: vcId, store: 'snap' } });
    }
  }
  if (vcs.length === 0) {
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

/**
 * Veramo Verify VP.
 *
 * @param snap - Snap.
 * @param vp - Verifiable Presentation.
 * @returns Verify result.
 */
export async function veramoVerifyVP(
  snap: SnapsGlobalObject,
  vp: VerifiablePresentation,
): Promise<IVerifyResult> {
  const agent = await getAgent(snap);
  return await agent.verifyPresentation({ presentation: vp });
}

/**
 * Veramo Connect Hedera account.
 *
 * @param agent - Veramo agent.
 * @param account - Account.
 * @param privateKey - Private key.
 * @returns Success.
 */
export async function veramoConnectHederaAccount(
  agent: Agent,
  account: string,
  privateKey: string,
): Promise<boolean> {
  const controllerKeyId = `metamask-${account}`;
  try {
    const keyPair: KeyPair = await getKeyPair(privateKey);
    await agent.keyManagerImport({
      kid: controllerKeyId,
      kms: 'snap',
      type: 'Secp256k1',
      privateKeyHex: keyPair.privateKey,
      publicKeyHex: keyPair.publicKey,
    });
  } catch (error) {
    console.log(`Could not connect to Hedera Account: ${error}`);
    return false;
  }
  return true;
}

/**
 * Veramo Import metamask account.
 *
 * @param identitySnapParams - Identity snap params.
 * @param agent - Veramo agent.
 * @returns Identifier.
 */
export async function veramoImportMetaMaskAccount(
  identitySnapParams: IdentitySnapParams,
  agent: Agent,
): Promise<IIdentifier> {
  const { snap, state, metamask } = identitySnapParams;
  const method =
    state.accountState[state.currentAccount].accountConfig.identity.didMethod;
  const did = await getCurrentDid(state, metamask);

  const controllerKeyId = `metamask-${state.currentAccount}`;

  const keyPair: KeyPair = { privateKey: '', publicKey: '' };
  // Use metamask private keys if it's not hedera network since we can directly use those
  // unlike for hedera where we request the user for their private key and accountId while configuring
  const chainId = await getCurrentNetwork(metamask);
  if (validHederaChainID(chainId)) {
    // TODO: This is a very hacky way to retrieve private key for hedera account. Try to use veramo agent if possible
    try {
      const privateKey =
        state.accountState[state.currentAccount].snapPrivateKeyStore[
          controllerKeyId
        ].privateKeyHex;
      const kp = await getKeyPair(privateKey);
      keyPair.privateKey = kp.privateKey;
      keyPair.publicKey = kp.publicKey;
    } catch (error) {
      console.log(
        `Failed to get private keys from Metamask account for Hedera network. Error: ${error}`,
      );
      throw new Error(
        `Failed to get private keys from Metamask account for Hedera network. Error: ${error}`,
      );
    }
  } else {
    const bip44CoinTypeNode = await getAddressKeyDeriver(snap);
    const res = await snapGetKeysFromAddress(
      bip44CoinTypeNode as BIP44CoinTypeNode,
      state,
      state.currentAccount,
      snap,
    );
    if (!res) {
      console.log('Failed to get private keys from Metamask account');
      throw new Error('Failed to get private keys from Metamask account');
    }
    keyPair.privateKey = res.privateKey.split('0x')[1];
    keyPair.publicKey = res.publicKey.split('0x')[1];
  }

  const identifier = await agent.didManagerImport({
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
    `Importing using did=${did}, provider=${method}, controllerKeyId=${controllerKeyId}...`,
  );

  console.log('imported successfully');
  return identifier;
}
