import type { AccountId, PrivateKey, PublicKey } from '@hashgraph/sdk';
import { BigNumber } from 'bignumber.js';

import { WalletHedera } from './wallet/abstract';

/* eslint-disable */
export interface HederaService {
  // returns null if the account ID does not match the chosen key
  createClient(options: {
    network: string;
    walletHedera: WalletHedera;
    // index into the wallet, meaning depends on the wallet type
    // 0 always means the canonical key for the wallet
    keyIndex: number;
    // account ID we wish to associate with the wallet
    accountId: AccountId;
  }): Promise<SimpleHederaClient | null>;

  getMirrorAccountInfo(
    network: 'mainnet' | 'testnet' | 'previewnet',
    accountId: AccountId
  ): Promise<MirrorAccountInfo>;
}

export interface SimpleHederaClient {
  // get the associated private key, if available
  getPrivateKey(): PrivateKey | null;

  // get the associated public key
  getPublicKey(): PublicKey;

  // get the associated account ID
  getAccountId(): AccountId;

  createAccount(options: {
    publicKey: PublicKey;
    initialBalance: BigNumber;
  }): Promise<AccountId | null>;
}

export interface MirrorAccountInfo {
  account: string;
  ethereum_nonce?: number;
  evm_address?: string;
  staked_account_id?: string;
  staked_node_id?: number;
  stake_period_start?: number;
}
