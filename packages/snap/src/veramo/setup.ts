import { SnapProvider } from '@metamask/snap-types';

import {
  createAgent,
  IDataStore,
  IDIDManager,
  IKeyManager,
  IResolver,
  TAgent,
} from '@veramo/core';
import { W3cMessageHandler } from '@veramo/credential-w3c';
import { JwtMessageHandler } from '@veramo/did-jwt';
import { AbstractIdentifierProvider, DIDManager } from '@veramo/did-manager';
import { DIDResolverPlugin } from '@veramo/did-resolver';
import { KeyManager } from '@veramo/key-manager';
import { KeyManagementSystem } from '@veramo/kms-local';
import { MessageHandler } from '@veramo/message-handler';
import { SdrMessageHandler } from '@veramo/selective-disclosure';
import { Resolver } from 'did-resolver';

import { getDidPkhResolver, PkhDIDProvider } from '@tuum-tech/did-provider-pkh';

import { IdentitySnapState } from '../interfaces';
import {
  SnapDIDStore,
  SnapKeyStore,
  SnapPrivateKeyStore,
} from './plugins/snapDataStore';

/* eslint-disable */
export async function getAgent(
  wallet: SnapProvider,
  state: IdentitySnapState
): Promise<TAgent<IDIDManager & IKeyManager & IDataStore & IResolver>> {
  const didProviders: Record<string, AbstractIdentifierProvider> = {};

  didProviders['did:pkh'] = new PkhDIDProvider({ defaultKms: 'web3' });

  const agent = createAgent<IDIDManager & IKeyManager & IDataStore & IResolver>(
    {
      plugins: [
        new KeyManager({
          store: new SnapKeyStore(wallet, state),
          kms: {
            snap: new KeyManagementSystem(
              new SnapPrivateKeyStore(wallet, state)
            ),
          },
        }),
        new DIDManager({
          store: new SnapDIDStore(wallet, state),
          defaultProvider: 'metamask',
          providers: didProviders,
        }),
        new MessageHandler({
          messageHandlers: [
            new JwtMessageHandler(),
            new W3cMessageHandler(),
            new SdrMessageHandler(),
          ],
        }),
        new DIDResolverPlugin({
          resolver: new Resolver({
            ...getDidPkhResolver(),
          }),
        }),
      ],
    }
  );

  return agent;
}
