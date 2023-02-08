import {
  createAgent,
  ICredentialIssuer,
  IDataStore,
  IDIDManager,
  IKeyManager,
  IResolver,
  TAgent,
} from '@veramo/core';
import { CredentialIssuerEIP712 } from '@veramo/credential-eip712';
/*import {
  CredentialIssuerLD,
  LdDefaultContexts,
  VeramoEcdsaSecp256k1RecoverySignature2020,
} from '@veramo/credential-ld'; */
import { CredentialPlugin, W3cMessageHandler } from '@veramo/credential-w3c';
import { JwtMessageHandler } from '@veramo/did-jwt';
import { AbstractIdentifierProvider, DIDManager } from '@veramo/did-manager';
import { DIDResolverPlugin } from '@veramo/did-resolver';
import { KeyManager } from '@veramo/key-manager';
import { KeyManagementSystem } from '@veramo/kms-local';
import { MessageHandler } from '@veramo/message-handler';
import { SdrMessageHandler } from '@veramo/selective-disclosure';
import { Resolver } from 'did-resolver';
import { PkhDIDProvider } from './plugins/did-provider-pkh/src/pkh-did-provider';
import { getResolver as getDidPkhResolver } from './plugins/did-provider-pkh/src/resolver';
import {
  AbstractDataStore,
  DataManager,
  IDataManager,
} from './plugins/verfiable-creds-manager';

import { SnapsGlobalObject } from '@metamask/snaps-types';
import {
  SnapDIDStore,
  SnapKeyStore,
  SnapPrivateKeyStore,
  SnapVCStore,
} from './plugins/snapDataStore';

export type Agent = TAgent<
  IKeyManager &
    IDIDManager &
    IResolver &
    IDataManager &
    ICredentialIssuer &
    IDataStore
>;

/* eslint-disable */
export const getAgent = async (snap: SnapsGlobalObject): Promise<Agent> => {
  const didProviders: Record<string, AbstractIdentifierProvider> = {};
  const vcStorePlugins: Record<string, AbstractDataStore> = {};

  didProviders['did:pkh'] = new PkhDIDProvider({ defaultKms: 'snap' });
  vcStorePlugins['snap'] = new SnapVCStore(snap);

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
      /*  new CredentialIssuerLD({
        contextMaps: [LdDefaultContexts],
        suites: [new VeramoEcdsaSecp256k1RecoverySignature2020()],
      }), */
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
};
