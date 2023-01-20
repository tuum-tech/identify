import { SnapProvider } from '@metamask/snap-types';
import { IIdentifier, IKey, W3CVerifiableCredential } from '@veramo/core';
import { AbstractDIDStore } from '@veramo/did-manager';
import {
  AbstractKeyStore,
  AbstractPrivateKeyStore,
  ImportablePrivateKey,
  ManagedPrivateKey,
} from '@veramo/key-manager';
import jsonpath from 'jsonpath';
import { v4 as uuidv4 } from 'uuid';
import { IdentitySnapState } from '../../interfaces';
import { decodeJWT } from '../../utils/jwt';
import { updateSnapState } from '../../utils/stateUtils';
import {
  AbstractDataStore,
  IFilterArgs,
  IQueryResult,
} from './verfiable-creds-manager';

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

  constructor(
    wallet: SnapProvider,
    state: IdentitySnapState,
    isHederaAccount: boolean
  ) {
    super();
    this.wallet = wallet;
    this.state = state;
    this.isHederaAccount = isHederaAccount;
  }

  async get({ kid }: { kid: string }): Promise<IKey> {
    let account = this.state.currentAccount;
    if (this.isHederaAccount) {
      account = this.state.hederaAccount.accountId;
    }
    if (!account) throw Error('Cannot get current account');

    const key = this.state.accountState[account].snapKeyStore[kid];
    if (!key) throw Error('Key not found');
    return key;
  }

  async delete({ kid }: { kid: string }) {
    let account = this.state.currentAccount;
    if (this.isHederaAccount) {
      account = this.state.hederaAccount.accountId;
    }
    if (!account) throw Error('Cannot get current account');

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
    if (!account) throw Error('Cannot get current account');

    this.state.accountState[account].snapKeyStore[args.kid] = { ...args };
    await updateSnapState(this.wallet, this.state);
    return true;
  }

  async list(): Promise<Exclude<IKey, 'privateKeyHex'>[]> {
    let account = this.state.currentAccount;
    if (this.isHederaAccount) {
      account = this.state.hederaAccount.accountId;
    }
    if (!account) throw Error('Cannot get current account');

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

  constructor(
    wallet: SnapProvider,
    state: IdentitySnapState,
    isHederaAccount: boolean
  ) {
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

  constructor(
    wallet: SnapProvider,
    state: IdentitySnapState,
    isHederaAccount: boolean
  ) {
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
    if (!account) throw Error(`Cannot get current account: ${account}`);
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
    if (!account) throw Error(`Cannot get current account: ${account}`);

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
    if (!account) throw Error(`Cannot get current account: ${account}`);

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
    if (!account) throw Error(`Cannot get current account: ${account}`);

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
 * An implementation of {@link AbstractDataStore} that holds everything in snap state.
 *
 * This is usable by {@link @vc-manager/VCManager} to hold the vc data
 */
export class SnapVCStore extends AbstractDataStore {
  wallet: SnapProvider;
  state: IdentitySnapState;
  isHederaAccount: boolean;

  constructor(
    wallet: SnapProvider,
    state: IdentitySnapState,
    isHederaAccount: boolean
  ) {
    super();
    this.wallet = wallet;
    this.state = state;
    this.isHederaAccount = isHederaAccount;
  }

  async query(args: IFilterArgs): Promise<Array<IQueryResult>> {
    const { filter } = args;
    let account = this.state.currentAccount;
    if (this.isHederaAccount) {
      account = this.state.hederaAccount.accountId;
    }
    if (!account) throw Error(`Cannot get current account: ${account}`);

    if (filter && filter.type === 'id') {
      try {
        if (this.state.accountState[account].vcs[filter.filter as string]) {
          let vc = this.state.accountState[account].vcs[
            filter.filter as string
          ] as unknown;
          if (typeof vc === 'string') {
            vc = decodeJWT(vc);
          }
          const obj = [
            {
              metadata: { id: filter.filter as string },
              data: vc,
            },
          ];
          return obj;
        } else return [];
      } catch (e) {
        throw new Error('Invalid id');
      }
    }
    if (filter === undefined || (filter && filter.type === 'none')) {
      return Object.keys(this.state.accountState[account].vcs).map((k) => {
        let vc = this.state.accountState[account].vcs[k] as unknown;
        if (typeof vc === 'string') {
          vc = decodeJWT(vc);
        }
        return {
          metadata: { id: k },
          data: vc,
        };
      });
    }
    if (filter && filter.type === 'JSONPath') {
      const objects = Object.keys(this.state.accountState[account].vcs).map(
        (k) => {
          let vc = this.state.accountState[account].vcs[k] as unknown;
          if (typeof vc === 'string') {
            vc = decodeJWT(vc);
          }
          return {
            metadata: { id: k },
            data: vc,
          };
        }
      );
      const filteredObjects = jsonpath.query(objects, filter.filter as string);
      return filteredObjects as Array<IQueryResult>;
    }
    return [];
  }

  async save(args: { data: W3CVerifiableCredential }): Promise<string> {
    //TODO check if VC is correct type

    const vc = args.data;
    let account = this.state.currentAccount;
    if (this.isHederaAccount) {
      account = this.state.hederaAccount.accountId;
    }
    if (!account) throw Error(`Cannot get current account: ${account}`);

    let id = uuidv4();
    while (this.state.accountState[account].vcs[id]) {
      id = uuidv4();
    }

    this.state.accountState[account].vcs[id] = vc;
    await updateSnapState(this.wallet, this.state);
    return id;
  }

  async delete({ id }: { id: string }): Promise<boolean> {
    let account = this.state.currentAccount;
    if (this.isHederaAccount) {
      account = this.state.hederaAccount.accountId;
    }
    if (!account) throw Error(`Cannot get current account: ${account}`);

    if (!this.state.accountState[account].vcs[id])
      throw Error(`VC ID '${id}' not found`);

    delete this.state.accountState[account].vcs[id];
    await updateSnapState(this.wallet, this.state);
    return true;
  }

  public async clear(args: IFilterArgs): Promise<boolean> {
    let account = this.state.currentAccount;
    if (this.isHederaAccount) {
      account = this.state.hederaAccount.accountId;
    }
    if (!account) throw Error(`Cannot get current account: ${account}`);

    this.state.accountState[account].vcs = {};
    await updateSnapState(this.wallet, this.state);
    return true;
  }
}
