import { IVCManager, VCManager } from '@blockchain-lab-um/veramo-vc-manager';
import { AbstractVCStore } from '@blockchain-lab-um/veramo-vc-manager/build/vc-store/abstract-vc-store';
import { Web3Provider } from '@ethersproject/providers';
import { SnapProvider } from '@metamask/snap-types';
import { getDidPkhResolver, PkhDIDProvider } from '@tuum-tech/did-provider-pkh';
import {
  createAgent,
  ICredentialPlugin,
  IDataStore,
  IDIDManager,
  IKeyManager,
  IResolver,
  TAgent,
} from '@veramo/core';
import { CredentialPlugin, W3cMessageHandler } from '@veramo/credential-w3c';
import { JwtMessageHandler } from '@veramo/did-jwt';
import { AbstractIdentifierProvider, DIDManager } from '@veramo/did-manager';
import { DIDResolverPlugin } from '@veramo/did-resolver';
import { KeyManager } from '@veramo/key-manager';
import { KeyManagementSystem } from '@veramo/kms-local';
import { Web3KeyManagementSystem } from '@veramo/kms-web3';
import { MessageHandler } from '@veramo/message-handler';
import { SdrMessageHandler } from '@veramo/selective-disclosure';
import { Resolver } from 'did-resolver';
import { IdentitySnapState } from '../interfaces';
import { getHederaChainIDs } from '../utils/config';
import { getCurrentNetwork } from '../utils/snapUtils';
import {
  SnapDIDStore,
  SnapKeyStore,
  SnapPrivateKeyStore,
  SnapVCStore,
} from './plugins/snapDataStore';

/* eslint-disable */
export async function getAgent(
  wallet: SnapProvider,
  state: IdentitySnapState
): Promise<
  TAgent<
    IKeyManager &
    IDIDManager &
    IResolver &
    IVCManager &
    ICredentialPlugin &
    IDataStore
  >
> {
  let isHederaAccount: boolean = false;
  const chain_id = await getCurrentNetwork(wallet);
  const hederaChainIDs = getHederaChainIDs();
  if (
    Array.from(hederaChainIDs.keys()).includes(chain_id)
  ) {
    isHederaAccount = true;
  }

  const web3Providers: Record<string, Web3Provider> = {};
  const didProviders: Record<string, AbstractIdentifierProvider> = {};
  const vcStorePlugins: Record<string, AbstractVCStore> = {};

  web3Providers['metamask'] = new Web3Provider(wallet as any);

  didProviders['did:pkh'] = new PkhDIDProvider({ defaultKms: 'snap' });
  vcStorePlugins['snap'] = new SnapVCStore(wallet, state, isHederaAccount);

  const agent = createAgent<
    IKeyManager &
    IDIDManager &
    IResolver &
    IVCManager &
    ICredentialPlugin &
    IDataStore
  >({
    plugins: [
      new KeyManager({
        store: new SnapKeyStore(wallet, state, isHederaAccount),
        kms: {
          web3: new Web3KeyManagementSystem(web3Providers),
          snap: new KeyManagementSystem(new SnapPrivateKeyStore(wallet, state, isHederaAccount)),
        },
      }),
      new DIDManager({
        store: new SnapDIDStore(wallet, state, isHederaAccount),
        defaultProvider: 'metamask',
        providers: didProviders,
      }),
      new DIDResolverPlugin({
        resolver: new Resolver({
          ...getDidPkhResolver(),
        }),
      }),
      new VCManager({ store: vcStorePlugins }),
      new CredentialPlugin(),
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
