import { AbstractVCStore } from '@blockchain-lab-um/veramo-vc-manager/build/vc-store/abstract-vc-store';
import { SnapProvider } from '@metamask/snap-types';
import { IIdentifier, IKey, VerifiableCredential } from '@veramo/core';
import { AbstractDIDStore } from '@veramo/did-manager';
import {
  AbstractKeyStore,
  AbstractPrivateKeyStore,
  ImportablePrivateKey,
  ManagedPrivateKey,
} from '@veramo/key-manager';
import { v4 as uuidv4 } from 'uuid';
import { IdentitySnapState } from '../../interfaces';
import { updateSnapState } from '../../utils/stateUtils';

/* eslint-disable */
/**
 * An implementation of {@link AbstractKeyStore} that holds everything in snap state.
 *
 * This is usable by {@link @veramo/kms-local} to hold the key data.
 */
export class SnapKeyStore extends AbstractKeyStore {
  wallet: SnapProvider;
  state: IdentitySnapState;
  isHederaAccount: boolean;

  constructor(wallet: SnapProvider, state: IdentitySnapState, isHederaAccount: boolean) {
    super();
    this.wallet = wallet;
    this.state = state;
    this.isHederaAccount = isHederaAccount;
  }
  private keys: Record<string, IKey> = {};

  async get({ kid }: { kid: string }): Promise<IKey> {
    let account = this.state.currentAccount;
    if (this.isHederaAccount) {
      account = this.state.hederaAccount.accountId;
    }
    if (!account) throw Error('User denied error');

    const key = this.state.accountState[account].snapKeyStore[kid];
    if (!key) throw Error('Key not found');
    return key;
  }

  async delete({ kid }: { kid: string }) {
    let account = this.state.currentAccount;
    if (this.isHederaAccount) {
      account = this.state.hederaAccount.accountId;
    }
    if (!account) throw Error('User denied error');

    if (!this.state.accountState[account].snapKeyStore[kid])
      throw Error('Key not found');

    delete this.state.accountState[account].snapKeyStore[kid];
    await updateSnapState(this.wallet, this.state);
    return true;
  }

  async import(args: IKey) {
    let account = this.state.currentAccount;
    if (this.isHederaAccount) {
      account = this.state.hederaAccount.accountId;
    }
    if (!account) throw Error('User denied error');

    this.state.accountState[account].snapKeyStore[args.kid] = { ...args };
    await updateSnapState(this.wallet, this.state);
    return true;
  }

  async list(): Promise<Exclude<IKey, 'privateKeyHex'>[]> {
    let account = this.state.currentAccount;
    if (this.isHederaAccount) {
      account = this.state.hederaAccount.accountId;
    }
    if (!account) throw Error('User denied error');

    const safeKeys = Object.values(
      this.state.accountState[account].snapKeyStore
    ).map((key) => {
      const { privateKeyHex, ...safeKey } = key;
      return safeKey;
    });
    return safeKeys;
  }
}

/**
 * An implementation of {@link AbstractPrivateKeyStore} that holds everything in snap state.
 *
 * This is usable by {@link @veramo/kms-local} to hold the key data.
 */
export class SnapPrivateKeyStore extends AbstractPrivateKeyStore {
  wallet: SnapProvider;
  state: IdentitySnapState;
  isHederaAccount: boolean;

  constructor(wallet: SnapProvider, state: IdentitySnapState, isHederaAccount: boolean) {
    super();
    this.wallet = wallet;
    this.state = state;
    this.isHederaAccount = isHederaAccount;
  }

  async get({ alias }: { alias: string }): Promise<ManagedPrivateKey> {
    let account = this.state.currentAccount;
    if (this.isHederaAccount) {
      account = this.state.hederaAccount.accountId;
    }
    if (!account) throw Error('User denied error');

    const key = this.state.accountState[account].snapPrivateKeyStore[alias];
    if (!key) throw Error(`not_found: PrivateKey not found for alias=${alias}`);
    return key;
  }

  async delete({ alias }: { alias: string }) {
    let account = this.state.currentAccount;
    if (this.isHederaAccount) {
      account = this.state.hederaAccount.accountId;
    }
    if (!account) throw Error('User denied error');

    if (!this.state.accountState[account].snapPrivateKeyStore[alias])
      throw Error('Key not found');

    delete this.state.accountState[account].snapPrivateKeyStore[alias];
    await updateSnapState(this.wallet, this.state);
    return true;
  }

  async import(args: ImportablePrivateKey) {
    let account = this.state.currentAccount;
    if (this.isHederaAccount) {
      account = this.state.hederaAccount.accountId;
    }
    if (!account) throw Error('User denied error');

    const alias = args.alias || uuidv4();
    const existingEntry =
      this.state.accountState[account].snapPrivateKeyStore[alias];
    if (existingEntry && existingEntry.privateKeyHex !== args.privateKeyHex) {
      console.error(
        'key_already_exists: key exists with different data, please use a different alias'
      );
      throw new Error(
        'key_already_exists: key exists with different data, please use a different alias'
      );
    }
    this.state.accountState[account].snapPrivateKeyStore[alias] = {
      ...args,
      alias,
    };
    await updateSnapState(this.wallet, this.state);
    return this.state.accountState[account].snapPrivateKeyStore[alias];
  }

  async list(): Promise<Array<ManagedPrivateKey>> {
    let account = this.state.currentAccount;
    if (this.isHederaAccount) {
      account = this.state.hederaAccount.accountId;
    }
    if (!account) throw Error('User denied error');

    return [
      ...Object.values(this.state.accountState[account].snapPrivateKeyStore),
    ];
  }
}

/**
 * An implementation of {@link AbstractDIDStore} that holds everything in snap state.
 *
 * This is usable by {@link @veramo/did-manager} to hold the did key data.
 */
export class SnapDIDStore extends AbstractDIDStore {
  wallet: SnapProvider;
  state: IdentitySnapState;
  isHederaAccount: boolean;

  constructor(wallet: SnapProvider, state: IdentitySnapState, isHederaAccount: boolean) {
    super();
    this.wallet = wallet;
    this.state = state;
    this.isHederaAccount = isHederaAccount;
  }

  async get({
    did,
    alias,
    provider,
  }: {
    did: string;
    alias: string;
    provider: string;
  }): Promise<IIdentifier> {
    let account = this.state.currentAccount;
    if (this.isHederaAccount) {
      account = this.state.hederaAccount.accountId;
    }
    if (!account) throw Error('User denied error');
    const identifiers = this.state.accountState[account].identifiers;

    if (did && !alias) {
      if (!identifiers[did])
        throw Error(`not_found: IIdentifier not found with did=${did}`);
      return identifiers[did];
    } else if (!did && alias && provider) {
      for (const key of Object.keys(identifiers)) {
        if (
          identifiers[key].alias === alias &&
          identifiers[key].provider === provider
        ) {
          return identifiers[key];
        }
      }
    } else {
      throw Error('invalid_argument: Get requires did or (alias and provider)');
    }
    throw Error(
      `not_found: IIdentifier not found with alias=${alias} provider=${provider}`
    );
  }

  async delete({ did }: { did: string }) {
    let account = this.state.currentAccount;
    if (this.isHederaAccount) {
      account = this.state.hederaAccount.accountId;
    }
    if (!account) throw Error('User denied error');

    if (!this.state.accountState[account].identifiers[did])
      throw Error('Identifier not found');

    delete this.state.accountState[account].identifiers[did];
    await updateSnapState(this.wallet, this.state);
    return true;
  }

  async import(args: IIdentifier) {
    let account = this.state.currentAccount;
    if (this.isHederaAccount) {
      account = this.state.hederaAccount.accountId;
    }
    if (!account) throw Error('User denied error');

    const identifier = { ...args };
    for (const key of identifier.keys) {
      if ('privateKeyHex' in key) {
        delete key.privateKeyHex;
      }
    }
    this.state.accountState[account].identifiers[args.did] = identifier;
    await updateSnapState(this.wallet, this.state);
    return true;
  }

  async list(args: {
    alias?: string;
    provider?: string;
  }): Promise<IIdentifier[]> {
    let account = this.state.currentAccount;
    if (this.isHederaAccount) {
      account = this.state.hederaAccount.accountId;
    }
    if (!account) throw Error('User denied error');

    let result: IIdentifier[] = [];
    for (const key of Object.keys(
      this.state.accountState[account].identifiers
    )) {
      result.push(this.state.accountState[account].identifiers[key]);
    }

    if (args.alias && !args.provider) {
      result = result.filter((i) => i.alias === args.alias);
    } else if (args.provider && !args.alias) {
      result = result.filter((i) => i.provider === args.provider);
    } else if (args.provider && args.alias) {
      result = result.filter(
        (i) => i.provider === args.provider && i.alias === args.alias
      );
    }

    return result;
  }
}

/**
 * An implementation of {@link AbstractVCStore} that holds everything in snap state.
 *
 * This is usable by {@link @vc-manager/VCManager} to hold the vc data
 */
export class SnapVCStore extends AbstractVCStore {
  wallet: SnapProvider;
  state: IdentitySnapState;
  isHederaAccount: boolean;

  constructor(wallet: SnapProvider, state: IdentitySnapState, isHederaAccount: boolean) {
    super();
    this.wallet = wallet;
    this.state = state;
    this.isHederaAccount = isHederaAccount;
  }

  async get(args: { id: string }): Promise<VerifiableCredential | null> {
    let account = this.state.currentAccount;
    if (this.isHederaAccount) {
      account = this.state.hederaAccount.accountId;
    }
    if (!account) throw Error('User denied error');

    if (!this.state.accountState[account].vcs[args.id])
      throw Error(`not_found: VC with key=${args.id} not found!`);
    return this.state.accountState[account].vcs[args.id];
  }

  async delete({ id }: { id: string }) {
    let account = this.state.currentAccount;
    if (this.isHederaAccount) {
      account = this.state.hederaAccount.accountId;
    }
    if (!account) throw Error('User denied error');

    if (!this.state.accountState[account].vcs[id]) throw Error('VC not found');

    delete this.state.accountState[account].vcs[id];
    await updateSnapState(this.wallet, this.state);
    return true;
  }

  async import(args: VerifiableCredential) {
    let account = this.state.currentAccount;
    if (this.isHederaAccount) {
      account = this.state.hederaAccount.accountId;
    }
    if (!account) throw Error('User denied error');

    let alias = uuidv4();
    while (this.state.accountState[account].vcs[alias]) {
      alias = uuidv4();
    }

    this.state.accountState[account].vcs[alias] = { ...args };
    await updateSnapState(this.wallet, this.state);
    return true;
  }

  async list(): Promise<VerifiableCredential[]> {
    let account = this.state.currentAccount;
    if (this.isHederaAccount) {
      account = this.state.hederaAccount.accountId;
    }
    if (!account) throw Error('User denied error');
    const result: VerifiableCredential[] = [];

    // TODO: Why we adding key -> we have id ?
    // Return type doesn't match with what we return
    Object.keys(this.state.accountState[account].vcs).forEach((key) => {
      result.push({ ...this.state.accountState[account].vcs[key], key: key });
    });

    return result;
  }
}
