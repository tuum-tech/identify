import {
  createAgent,
  ICredentialIssuer,
  IDataStore,
  IDIDManager,
  IKeyManager,
  IResolver,
  IVerifyResult,
  ProofFormat,
  TAgent,
  VerifiableCredential,
  VerifiablePresentation,
  W3CVerifiableCredential,
} from '@veramo/core';
import { CredentialIssuerEIP712 } from '@veramo/credential-eip712';

import { SnapsGlobalObject } from '@metamask/snaps-types';
import { CredentialPlugin, W3cMessageHandler } from '@veramo/credential-w3c';
import { JwtMessageHandler } from '@veramo/did-jwt';
import { AbstractIdentifierProvider, DIDManager } from '@veramo/did-manager';
import { getDidPkhResolver, PkhDIDProvider } from '@veramo/did-provider-pkh';
import { DIDResolverPlugin } from '@veramo/did-resolver';
import { KeyManager } from '@veramo/key-manager';
import { KeyManagementSystem } from '@veramo/kms-local';
import { MessageHandler } from '@veramo/message-handler';
import { SdrMessageHandler } from '@veramo/selective-disclosure';
import { DIDResolutionResult, Resolver } from 'did-resolver';

import { MetaMaskInpageProvider } from '@metamask/providers';
import {
  CredentialIssuerLD,
  LdDefaultContexts,
  VeramoEcdsaSecp256k1RecoverySignature2020,
} from '@veramo/credential-ld';
import cloneDeep from 'lodash.clonedeep';
import { validHederaChainID } from '../hedera/config';
import {
  IdentitySnapParams,
  IdentitySnapState,
  SnapDialogParams,
} from '../interfaces';
import { GoogleDriveVCStore } from '../plugins/veramo/google-drive-data-store';
import {
  SnapDIDStore,
  SnapKeyStore,
  SnapPrivateKeyStore,
  SnapVCStore,
} from '../plugins/veramo/snap-data-store/src/snapDataStore';
import {
  AbstractDataStore,
  DataManager,
  Filter,
  IDataManager,
  IDataManagerClearResult,
  IDataManagerDeleteResult,
  IDataManagerQueryResult,
  IDataManagerSaveResult,
  ISaveArgs,
} from '../plugins/veramo/verfiable-creds-manager';
import { generateVCPanel, snapDialog } from '../snap/dialog';
import { getCurrentNetwork } from '../snap/network';
import { CreateVPRequestParams, GetVCsOptions } from '../types/params';
import { veramoImportMetaMaskAccount } from './accountImport';

export type Agent = TAgent<
  IKeyManager &
    IDIDManager &
    IResolver &
    IDataManager &
    ICredentialIssuer &
    IDataStore
>;

export class VeramoAgent {
  snap: SnapsGlobalObject;

  state: IdentitySnapState;

  metamask: MetaMaskInpageProvider;

  agent: Agent;

  constructor(identitySnapParams: IdentitySnapParams) {
    const { snap, state, metamask } = identitySnapParams;
    this.snap = snap;
    this.state = state;
    this.metamask = metamask;
    this.agent = this._getVeramoAgent(snap);
  }

  /**
   * Veramo Resolves DID.
   *
   * @param didUrl - DID url.
   * @returns Resolution result.
   */
  async resolveDid(didUrl?: string): Promise<DIDResolutionResult> {
    let did = didUrl;
    // GET DID if not exists
    if (!did) {
      const identifier = await veramoImportMetaMaskAccount(
        this.snap,
        this.state,
        this.metamask,
        this.agent,
      );
      did = identifier.did;
    }
    return await this.agent.resolveDid({
      didUrl: did,
    });
  }

  /**
   * Veramo Get VCs.
   *
   * @param options - Get VCs options.
   * @param filter - Filter parameters.
   * @returns VCs.
   */
  async getVCs(
    options: GetVCsOptions,
    filter?: Filter,
  ): Promise<IDataManagerQueryResult[]> {
    const result = (await this.agent.queryVC({
      filter,
      options,
      accessToken:
        this.state.accountState[this.state.currentAccount].accountConfig
          .identity.googleAccessToken,
    })) as IDataManagerQueryResult[];
    return result;
  }

  /**
   * Veramo Create VC.
   *
   * @param vcKey - VC key.
   * @param vcValue - VC value.
   * @param store - Store to save.
   * @param credTypes - Credential types.
   * @returns Save result.
   */
  async createVC(
    vcKey: string,
    vcValue: object,
    store: string | string[],
    credTypes: string[],
  ): Promise<IDataManagerSaveResult[]> {
    // GET DID
    const identifier = await veramoImportMetaMaskAccount(
      this.snap,
      this.state,
      this.metamask,
      this.agent,
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
    const chainId = await getCurrentNetwork(this.metamask);
    if (validHederaChainID(chainId)) {
      const hederaAccountId =
        this.state.accountState[this.state.currentAccount].hederaAccount
          .accountId;
      issuer.hederaAccountId = hederaAccountId;
      credentialSubject.hederaAccountId = hederaAccountId;
    }
    credential.set('issuer', issuer); // the entity that issued the credential
    credential.set('credentialSubject', credentialSubject);

    const verifiableCredential: W3CVerifiableCredential =
      await this.agent.createVerifiableCredential({
        credential: JSON.parse(JSON.stringify(Object.fromEntries(credential))),
        // digital proof that makes the credential tamper-evident
        proofFormat: 'jwt' as ProofFormat,
      });

    console.log(
      'Created verifiableCredential: ',
      JSON.stringify(verifiableCredential, null, 4),
    );
    const result = await this.agent.saveVC({
      data: {
        data: [{ vc: verifiableCredential }],
      },
      options: { store },
      accessToken:
        this.state.accountState[this.state.currentAccount].accountConfig
          .identity.googleAccessToken,
    });

    console.log(
      'Saved verifiableCredential: ',
      JSON.stringify(result, null, 4),
    );
    return result;
  }

  /**
   * Veramo Save VC.
   *
   * @param data - ISave args.
   * @param store - Store to save.
   * @returns Save result.
   */
  async saveVC(
    data: ISaveArgs,
    store: string | string[],
  ): Promise<IDataManagerSaveResult[]> {
    const result = await this.agent.saveVC({
      data,
      options: { store },
      accessToken:
        this.state.accountState[this.state.currentAccount].accountConfig
          .identity.googleAccessToken,
    });
    return result;
  }

  /**
   * Veramo verify vc.
   *
   * @param vc - Verifiable Credential.
   * @returns Verify result.
   */
  async verifyVC(vc: W3CVerifiableCredential): Promise<IVerifyResult> {
    return await this.agent.verifyCredential({ credential: vc });
  }

  /**
   * Veramo remove vc.
   *
   * @param ids - Ids to remove.
   * @param store - Store to remove from.
   * @returns Delete result.
   */
  async removeVC(
    ids: string[],
    store: string | string[],
  ): Promise<IDataManagerDeleteResult[]> {
    let options: any;
    if (store) {
      options = { store };
    }

    return Promise.all(
      ids.map(async (id) => {
        return await this.agent.deleteVC({
          id,
          options,
          accessToken:
            this.state.accountState[this.state.currentAccount].accountConfig
              .identity.googleAccessToken,
        });
      }),
    ).then((data: IDataManagerDeleteResult[][]) => {
      return data.flat();
    });
  }

  /**
   * Veramo Delete all VCs.
   *
   * @param store - Store to remove from.
   * @returns Clear result.
   */
  async deleteAllVCs(
    store: string | string[],
  ): Promise<IDataManagerClearResult[]> {
    let options: any;
    if (store) {
      options = { store };
    }

    return await this.agent.clearVCs({
      options,
      accessToken:
        this.state.accountState[this.state.currentAccount].accountConfig
          .identity.googleAccessToken,
    });
  }

  /**
   * Veramo Create VP.
   *
   * @param vpRequestParams - VP request params.
   * @returns Created VP.
   */
  async createVP(
    vpRequestParams: CreateVPRequestParams,
  ): Promise<VerifiablePresentation | null> {
    const vcsMetadata = vpRequestParams.vcs;
    const proofFormat = vpRequestParams.proofInfo?.proofFormat
      ? vpRequestParams.proofInfo.proofFormat
      : ('jwt' as ProofFormat);
    const type = vpRequestParams.proofInfo?.type
      ? vpRequestParams.proofInfo.type
      : 'Custom';
    const domain = vpRequestParams.proofInfo?.domain;
    const challenge = vpRequestParams.proofInfo?.challenge;

    // GET DID
    const identifier = await veramoImportMetaMaskAccount(
      this.snap,
      this.state,
      this.metamask,
      this.agent,
    );
    const { did } = identifier;

    const vcs: VerifiableCredential[] = [];
    const vcsWithMetadata: IDataManagerQueryResult[] = [];

    for (const vcId of vcsMetadata) {
      const vcObj = (await this.agent.queryVC({
        filter: {
          type: 'id',
          filter: vcId,
        },
        options: { store: 'snap' },
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
      return null;
    }
    const config = this.state.snapConfig;

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
    if (
      config.dApp.disablePopups ||
      (await snapDialog(this.snap, dialogParams))
    ) {
      const vp = await this.agent.createVerifiablePresentation({
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
   * @param vp - Verifiable Presentation.
   * @returns Verify result.
   */
  async verifyVP(vp: VerifiablePresentation): Promise<IVerifyResult> {
    return await this.agent.verifyPresentation({ presentation: vp });
  }

  _getVeramoAgent(snap: SnapsGlobalObject): Agent {
    const didProviders: Record<string, AbstractIdentifierProvider> = {};
    const vcStorePlugins: Record<string, AbstractDataStore> = {};

    didProviders['did:pkh'] = new PkhDIDProvider({ defaultKms: 'snap' });
    vcStorePlugins.snap = new SnapVCStore(snap);
    vcStorePlugins.googleDrive = new GoogleDriveVCStore(snap);

    const agent = createAgent<
      IKeyManager &
        IDIDManager &
        IResolver &
        IDataManager &
        ICredentialIssuer &
        IDataStore
    >({
      plugins: [
        new KeyManager({
          store: new SnapKeyStore(snap),
          kms: {
            snap: new KeyManagementSystem(new SnapPrivateKeyStore(snap)),
          },
        }),
        new DIDManager({
          store: new SnapDIDStore(snap),
          defaultProvider: 'metamask',
          providers: didProviders,
        }),
        new DIDResolverPlugin({
          resolver: new Resolver({
            ...getDidPkhResolver(),
          }),
        }),
        new DataManager({ store: vcStorePlugins }),
        new CredentialPlugin(),
        new CredentialIssuerEIP712(),
        new CredentialIssuerLD({
          contextMaps: [LdDefaultContexts],
          suites: [new VeramoEcdsaSecp256k1RecoverySignature2020()],
        }),
        new MessageHandler({
          messageHandlers: [
            new JwtMessageHandler(),
            new W3cMessageHandler(),
            new SdrMessageHandler(),
          ],
        }),
      ],
    });

    return agent;
  }
}
