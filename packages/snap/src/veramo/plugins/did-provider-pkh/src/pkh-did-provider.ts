import { computeAddress } from '@ethersproject/transactions';
import { IAgentContext, IIdentifier, IKey, IKeyManager, IService, ManagedKeyInfo } from '@veramo/core';

import { AccountId, Client, PrivateKey } from '@hashgraph/sdk';
import { AbstractIdentifierProvider } from '@veramo/did-manager';

import { SimpleHederaClientImpl } from './../../../../hedera/client';
import { testClientOperatorMatch } from './../../../../hedera/index';
import { SimpleHederaClient } from './../../../../hedera/service';
import { WalletHedera } from './../../../../hedera/wallet/abstract';
import { PrivateKeySoftwareWallet } from './../../../../hedera/wallet/software-private-key';
type IContext = IAgentContext<IKeyManager>;

/**
 * Options for creating a did:ethr
 * @beta
 */
export interface CreateDidPkhOptions {

  network: 'eip155' | 'hedera'
  /**
   * This can be hex encoded chain ID (string) or a chainId number
   *
   * If this is not specified, `1` is assumed.
   */
  chainId?: string | number
  hederaAccountId?: string
  privateKey?: string
}


 /**
 * Helper method that can computes the ethereumAddress corresponding to a Secp256k1 public key.
 * @param hexPublicKey A hex encoded public key, optionally prefixed with `0x`
 */
  export function toEthereumAddress(hexPublicKey: string): string {
    const publicKey = hexPublicKey.startsWith('0x') ? hexPublicKey : '0x' + hexPublicKey
    return computeAddress(publicKey)
  }


  export async function createClient(options: {
    walletHedera: WalletHedera;
    network: string;
    keyIndex: number;
    accountId: AccountId;
  }): Promise<SimpleHederaClient | null> {
    
    const client = Client.forNetwork(options.network as any);
    const transactionSigner = await options.walletHedera.getTransactionSigner(
      options.keyIndex
    );
    const privateKey = await options.walletHedera.getPrivateKey(
      options.keyIndex
    );
    const publicKey = await options.walletHedera.getPublicKey(options.keyIndex);
    let pubkey = publicKey?.toStringRaw();
    let pubkeyAdd = publicKey?.toEthereumAddress();

    // TODO: Fix
    client.setOperatorWith(
      options.accountId,
      publicKey ?? '',
      transactionSigner
    );

    if (!(await testClientOperatorMatch(client))) {
      return null;
    }

    return new SimpleHederaClientImpl(client, privateKey);
  }


  export async function checkHederaAccount(
    _privateKey: string,
    _accountId: string,
    _chainId: string
  ): Promise<boolean> {
    //const hederaChainIDs = getHederaChainIDs();
    //const chain_id = await getCurrentNetwork(wallet);
    //if (Array.from(hederaChainIDs.keys()).includes(chain_id)) {
      const accountId = AccountId.fromString(_accountId);
      const privateKey = PrivateKey.fromStringECDSA(_privateKey);
      const publicKey = privateKey.publicKey;
      const walletHedera: WalletHedera = new PrivateKeySoftwareWallet(privateKey);
      const client = await createClient({
        walletHedera,
        keyIndex: 0,
        accountId: accountId,
        network: _chainId,
      });
      if (client != null) {
        const info = await client.getAccountInfo(_accountId);
        // state.hederaAccount.evmAddress = info.contractAccountId;
        // if (state.hederaAccount.evmAddress !== state.currentAccount) {
        //   state.currentAccount = state.hederaAccount.evmAddress;
        // }
        // state.hederaAccount.privateKey = privateKey.toStringRaw();
        // state.hederaAccount.publicKey = publicKey.toStringRaw();
        // state.hederaAccount.accountId = accountId.toString();
        // await updateSnapState(wallet, state);
        return true;
      } else {
        console.error('Invalid private key or account Id');
        return false;
      }
 }

/**
 * {@link @veramo/did-manager#DIDManager} identifier provider for `did:pkh` identifiers
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export class PkhDIDProvider extends AbstractIdentifierProvider {
    private defaultKms: string

    constructor(options: {
      defaultKms: string
    })
    {
      super()
      this.defaultKms = options.defaultKms
    }



  async createIdentifier(
    { kms, options }: { kms?: string; options?: CreateDidPkhOptions },
    context: IContext,
  ): Promise<Omit<IIdentifier, 'provider'>> {

   
    let key: ManagedKeyInfo | null = null;
    if (options?.network === "hedera"){

      let isAccountValid = await checkHederaAccount(options.privateKey as string, options.hederaAccountId as string, options.chainId as string)  
      if (isAccountValid === false){
        console.error("invalid");
        throw new Error("invalid");
      }

      key = await context.agent.keyManagerImport({ kms: kms || this.defaultKms, type: 'Secp256k1', privateKeyHex: options.privateKey as string })
    } else {

      key = await context.agent.keyManagerCreate({ kms: kms || this.defaultKms, type: 'Secp256k1' })
    }

    const publicAddress = options?.network === 'eip155' ? toEthereumAddress(key.publicKeyHex) : options?.hederaAccountId;

    const chainId = options?.chainId; 
    if (!chainId) {
      throw new Error(
        `invalid_setup: Cannot create did:pkh. There is no known configuration for network=${chainId}'`,
      )
    }

    const identifier: Omit<IIdentifier, 'provider'> = {
      did: 'did:pkh:' + options.network + ':' + chainId + ':' + publicAddress,
      controllerKeyId: key.kid,
      keys: [key],
      services: [],
    }
    return identifier;
  }
  async updateIdentifier(args: { did: string; kms?: string | undefined; alias?: string | undefined; options?: any }, context: IAgentContext<IKeyManager>): Promise<IIdentifier> {
    throw new Error('PkhDIDProvider updateIdentifier not supported yet.')
  }

  async deleteIdentifier(identifier: IIdentifier, context: IContext): Promise<boolean> {
    for (const { kid } of identifier.keys) {
      await context.agent.keyManagerDelete({ kid });
    }
    return true
  }

  async addKey(
    { identifier, key, options }: { identifier: IIdentifier; key: IKey; options?: any },
    context: IContext,
  ): Promise<any> {
    throw Error('PkhDIDProvider addKey not supported');
  }

  async addService(
    { identifier, service, options }: { identifier: IIdentifier; service: IService; options?: any },
    context: IContext,
  ): Promise<any> {
    throw Error('PkhDIDProvider addService not supported');
  }

  async removeKey(
    args: { identifier: IIdentifier; kid: string; options?: any },
    context: IContext,
  ): Promise<any> {
    throw Error('PkhDIDProvider removeKey not supported');
  }

  async removeService(
    args: { identifier: IIdentifier; id: string; options?: any },
    context: IContext,
  ): Promise<any> {
    throw Error('PkhDIDProvider removeService not supported');
  }



}

