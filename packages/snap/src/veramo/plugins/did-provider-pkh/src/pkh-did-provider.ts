import { computeAddress } from '@ethersproject/transactions';
import {
  IAgentContext,
  IIdentifier,
  IKey,
  IKeyManager,
  IService,
  ManagedKeyInfo,
} from '@veramo/core';

import { AccountId, PrivateKey } from '@hashgraph/sdk';
import { AbstractIdentifierProvider } from '@veramo/did-manager';

import { getHederaChainIDs } from './hedera/config';
import { HederaServiceImpl } from './hedera/index';
import { HederaAccountInfo } from './hedera/service';
import { WalletHedera } from './hedera/wallet/abstract';
import { PrivateKeySoftwareWallet } from './hedera/wallet/software-private-key';
type IContext = IAgentContext<IKeyManager>;

/**
 * Options for creating a did:ethr
 * @beta
 */
export interface CreateDidPkhOptions {
  network: 'eip155' | 'hedera';
  /**
   * This can be hex encoded chain ID (string) or a chainId number
   *
   * If this is not specified, `1` is assumed.
   */
  chainId?: string;
  hederaAccount?: {
    privateKey: string;
    accountId: string;
  };
}

/**
 * Helper method that can computes the ethereumAddress corresponding to a Secp256k1 public key.
 * @param hexPublicKey A hex encoded public key, optionally prefixed with `0x`
 */
export function toEthereumAddress(hexPublicKey: string): string {
  const publicKey = hexPublicKey.startsWith('0x')
    ? hexPublicKey
    : '0x' + hexPublicKey;
  return computeAddress(publicKey);
}

export async function toHederaAccountInfo(
  _privateKey: string,
  _accountId: string,
  _network: string
): Promise<HederaAccountInfo | null> {
  const accountId = AccountId.fromString(_accountId);
  const privateKey = PrivateKey.fromStringECDSA(_privateKey);
  const walletHedera: WalletHedera = new PrivateKeySoftwareWallet(privateKey);
  const hedera = new HederaServiceImpl();

  const client = await hedera.createClient({
    walletHedera,
    keyIndex: 0,
    accountId: accountId,
    network: _network,
  });
  if (client != null) {
    return await client.getAccountInfo(_accountId);
  } else {
    console.error('Invalid private key or account Id');
    return null;
  }
}

/**
 * {@link @veramo/did-manager#DIDManager} identifier provider for `did:pkh` identifiers
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export class PkhDIDProvider extends AbstractIdentifierProvider {
  private defaultKms: string;
  private chainId: string;

  constructor(options: { defaultKms: string; chainId?: string }) {
    super();
    this.defaultKms = options.defaultKms;
    this.chainId = options?.chainId ? options.chainId : '1';
  }

  async createIdentifier(
    { kms, options }: { kms?: string; options?: CreateDidPkhOptions },
    context: IContext
  ): Promise<Omit<IIdentifier, 'provider'>> {
    let key: ManagedKeyInfo | null = null;

    const network = options?.network ? options.network : 'eip155';
    let publicAddress: string = '';

    if (network === 'eip155') {
      key = await context.agent.keyManagerCreate({
        kms: kms || this.defaultKms,
        type: 'Secp256k1',
      });
      publicAddress = toEthereumAddress(key.publicKeyHex);
    } else if (network === 'hedera') {
      const hederaChainIDs = getHederaChainIDs();
      if (Array.from(hederaChainIDs.keys()).includes(this.chainId)) {
        if (
          options?.hederaAccount &&
          options.hederaAccount.privateKey.length !== 0 &&
          options.hederaAccount.accountId.length !== 0
        ) {
          const privateKey = options.hederaAccount.privateKey;
          const accountId = options.hederaAccount.accountId;

          publicAddress = accountId;
          const hederaAccountInfo = await toHederaAccountInfo(
            privateKey,
            accountId,
            hederaChainIDs.get(this.chainId) as string
          );

          if (hederaAccountInfo === null) {
            throw new Error('Could not retrieve hedera account info');
          }

          key = await context.agent.keyManagerImport({
            kms: kms || this.defaultKms,
            type: 'Secp256k1',
            privateKeyHex: privateKey as string,
          });
        } else {
          console.error('Hedera Account private key or account Id was not set');
          throw new Error(
            'Hedera Account private key or account Id was not set'
          );
        }
      } else {
        console.error(
          'Invalid Chain ID. Valid chainIDs for Hedera: [0x127: mainnet, 0x128: testnet, 0x129: previewnet, 0x12a: localnet]'
        );
        throw new Error(
          'Non-Hedera network was selected on Metamask while trying to configure the Hedera network. Please switch the network to Hedera Network first'
        );
      }
    }

    if (key !== null) {
      const identifier: Omit<IIdentifier, 'provider'> = {
        did: 'did:pkh:' + network + ':' + this.chainId + ':' + publicAddress,
        controllerKeyId: key.kid,
        keys: [key],
        services: [],
      };
      return identifier;
    } else {
      console.error('Could not create identifier due to some errors');
      throw new Error('Could not create identifier due to some errors');
    }
  }

  async updateIdentifier(
    args: {
      did: string;
      kms?: string | undefined;
      alias?: string | undefined;
      options?: any;
    },
    context: IAgentContext<IKeyManager>
  ): Promise<IIdentifier> {
    throw new Error('PkhDIDProvider updateIdentifier not supported yet.');
  }

  async deleteIdentifier(
    identifier: IIdentifier,
    context: IContext
  ): Promise<boolean> {
    for (const { kid } of identifier.keys) {
      await context.agent.keyManagerDelete({ kid });
    }
    return true;
  }

  async addKey(
    {
      identifier,
      key,
      options,
    }: { identifier: IIdentifier; key: IKey; options?: any },
    context: IContext
  ): Promise<any> {
    throw Error('PkhDIDProvider addKey not supported');
  }

  async addService(
    {
      identifier,
      service,
      options,
    }: { identifier: IIdentifier; service: IService; options?: any },
    context: IContext
  ): Promise<any> {
    throw Error('PkhDIDProvider addService not supported');
  }

  async removeKey(
    args: { identifier: IIdentifier; kid: string; options?: any },
    context: IContext
  ): Promise<any> {
    throw Error('PkhDIDProvider removeKey not supported');
  }

  async removeService(
    args: { identifier: IIdentifier; id: string; options?: any },
    context: IContext
  ): Promise<any> {
    throw Error('PkhDIDProvider removeService not supported');
  }
}
