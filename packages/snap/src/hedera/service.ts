import type {
  AccountId,
  Hbar,
  LedgerId,
  PrivateKey,
  PublicKey,
  Timestamp,
} from '@hashgraph/sdk';
import TokenRelationship from '@hashgraph/sdk/lib/account/TokenRelationship';
import Duration from '@hashgraph/sdk/lib/Duration';
import StakingInfo from '@hashgraph/sdk/lib/StakingInfo';
import { BigNumber } from 'bignumber.js';

import { WalletHedera } from './wallet/abstract';

export type HederaService = {
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
};

export type SimpleHederaClient = {
  // get the associated private key, if available
  getPrivateKey(): PrivateKey | null;

  // get the associated public key
  getPublicKey(): PublicKey;

  // get the associated account ID
  getAccountId(): AccountId;

  getAccountInfo(accountId: string): Promise<HederaAccountInfo>;

  createAccountForPublicKey(options: {
    publicKey: PublicKey;
    initialBalance: BigNumber;
  }): Promise<AccountId | null>;

  createAccountForEvmAddress(options: {
    evmAddress: string;
    initialBalance: BigNumber;
  }): Promise<AccountId | null>;
};

export type HederaAccountInfo = {
  accountId: AccountId;
  aliasKey: PublicKey;
  autoRenewPeriod: Duration;
  balance: Hbar;
  contractAccountId: string;
  ethereumNonce: Long;
  expirationTime: Timestamp;
  hbarAllowances: object;
  isDeleted: boolean;
  isReceiverSignatureRequired: boolean;
  key: PublicKey;
  ledgerId: LedgerId;
  liveHashes: object;
  maxAutomaticTokenAssociations: Long;
  nftAllowances: object;
  ownedNfts: Long;
  proxyAccountId: object;
  proxyReceived: Hbar;
  receiveRecordThreshold: Hbar;
  sendRecordThreshold: Hbar;
  stakingInfo: StakingInfo;
  tokenAllowances: object;
  tokenRelationships: TokenRelationship;
};
