import { SnapsGlobalObject } from '@metamask/snaps-types';
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
import { getSnapState, updateSnapState } from '../../rpc/snap/state';
import { decodeJWT } from '../../utils/jwt';
import {
  AbstractDataStore,
  IFilterArgs,
  IQueryResult,
} from './verfiable-creds-manager';

/**
 * An implementation of {@link AbstractKeyStore} that holds everything in snap state.
 *
 * This is usable by {@link @veramo/kms-local} to hold the key data.
 */
export class SnapKeyStore extends AbstractKeyStore {
  snap: SnapsGlobalObject;

  constructor(snap: SnapsGlobalObject) {
    super();
    this.snap = snap;
  }

  async getKey({ kid }: { kid: string }): Promise<IKey> {
    const state = await getSnapState(this.snap);
    const account = state.currentAccount;
    if (!account) {
      throw Error(`SnapKeyStore - Cannot get current account: ${account}`);
    }

    const key = state.accountState[account].snapKeyStore[kid];
    if (!key) {
      throw Error(`SnapKeyStore - kid '${kid}' not found`);
    }
    return key;
  }

  async deleteKey({ kid }: { kid: string }) {
    const state = await getSnapState(this.snap);
    const account = state.currentAccount;
    if (!account) {
      throw Error(`SnapKeyStore - Cannot get current account: ${account}`);
    }

    if (!state.accountState[account].snapKeyStore[kid]) {
      throw Error(`SnapKeyStore - kid '${kid}' not found`);
    }

    delete state.accountState[account].snapKeyStore[kid];
    await updateSnapState(this.snap, state);
    return true;
  }

  async importKey(args: IKey) {
    const state = await getSnapState(this.snap);
    const account = state.currentAccount;
    if (!account) {
      throw Error(`SnapKeyStore - Cannot get current account: ${account}`);
    }

    state.accountState[account].snapKeyStore[args.kid] = { ...args };
    await updateSnapState(this.snap, state);
    return true;
  }

  async listKeys(): Promise<Exclude<IKey, 'privateKeyHex'>[]> {
    const state = await getSnapState(this.snap);
    const account = state.currentAccount;
    if (!account) {
      throw Error(`SnapKeyStore - Cannot get current account: ${account}`);
    }

    const safeKeys = Object.values(
      state.accountState[account].snapKeyStore,
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
  snap: SnapsGlobalObject;

  constructor(snap: SnapsGlobalObject) {
    super();
    this.snap = snap;
  }

  async getKey({ alias }: { alias: string }): Promise<ManagedPrivateKey> {
    const state = await getSnapState(this.snap);
    const account = state.currentAccount;
    if (!account) {
      throw Error(
        `SnapPrivateKeyStore - Cannot get current account: ${account}`,
      );
    }

    const key = state.accountState[account].snapPrivateKeyStore[alias];
    if (!key) {
      throw Error(
        `SnapPrivateKeyStore - not_found: PrivateKey not found for alias=${alias}`,
      );
    }
    return key;
  }

  async deleteKey({ alias }: { alias: string }) {
    const state = await getSnapState(this.snap);
    const account = state.currentAccount;
    if (!account) {
      throw Error(
        `SnapPrivateKeyStore - Cannot get current account: ${account}`,
      );
    }

    if (!state.accountState[account].snapPrivateKeyStore[alias]) {
      throw Error('SnapPrivateKeyStore - Key not found');
    }

    delete state.accountState[account].snapPrivateKeyStore[alias];
    await updateSnapState(this.snap, state);
    return true;
  }

  async importKey(args: ImportablePrivateKey) {
    const state = await getSnapState(this.snap);
    const account = state.currentAccount;
    if (!account) {
      throw Error(
        `SnapPrivateKeyStore - Cannot get current account: ${account}`,
      );
    }

    const alias = args.alias || uuidv4();
    const existingEntry =
      state.accountState[account].snapPrivateKeyStore[alias];
    if (existingEntry && existingEntry.privateKeyHex !== args.privateKeyHex) {
      console.error(
        'SnapPrivateKeyStore - key_already_exists: key exists with different data, please use a different alias',
      );
      throw new Error(
        'SnapPrivateKeyStore - key_already_exists: key exists with different data, please use a different alias',
      );
    }

    state.accountState[account].snapPrivateKeyStore[alias] = {
      ...args,
      alias,
    };
    await updateSnapState(this.snap, state);
    return state.accountState[account].snapPrivateKeyStore[alias];
  }

  async listKeys(): Promise<ManagedPrivateKey[]> {
    const state = await getSnapState(this.snap);
    const account = state.currentAccount;
    if (!account) {
      throw Error(
        `SnapPrivateKeyStore - Cannot get current account: ${account}`,
      );
    }

    return [...Object.values(state.accountState[account].snapPrivateKeyStore)];
  }
}

/**
 * An implementation of {@link AbstractDIDStore} that holds everything in snap state.
 *
 * This is usable by {@link @veramo/did-manager} to hold the did key data.
 */
export class SnapDIDStore extends AbstractDIDStore {
  snap: SnapsGlobalObject;

  constructor(snap: SnapsGlobalObject) {
    super();
    this.snap = snap;
  }

  async getDID({
    did,
    alias,
    provider,
  }: {
    did: string;
    alias: string;
    provider: string;
  }): Promise<IIdentifier> {
    const state = await getSnapState(this.snap);
    const account = state.currentAccount;
    if (!account) {
      throw Error(`SnapDIDStore - Cannot get current account: ${account}`);
    }
    const { identifiers } = state.accountState[account];

    if (did && !alias) {
      if (!identifiers[did]) {
        throw Error(
          `SnapDIDStore - not_found: IIdentifier not found with did=${did}`,
        );
      }
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
      throw Error(
        'SnapDIDStore - invalid_argument: Get requires did or (alias and provider)',
      );
    }
    throw Error(
      `SnapDIDStore - not_found: IIdentifier not found with alias=${alias} provider=${provider}`,
    );
  }

  async deleteDID({ did }: { did: string }) {
    const state = await getSnapState(this.snap);
    const account = state.currentAccount;
    if (!account) {
      throw Error(`SnapDIDStore - Cannot get current account: ${account}`);
    }

    if (!state.accountState[account].identifiers[did]) {
      throw Error(
        `SnapDIDStore - not_found: IIdentifier not found with did=${did}`,
      );
    }

    delete state.accountState[account].identifiers[did];
    await updateSnapState(this.snap, state);
    return true;
  }

  async importDID(args: IIdentifier) {
    const state = await getSnapState(this.snap);
    const account = state.currentAccount;
    if (!account) {
      throw Error(`SnapDIDStore - Cannot get current account: ${account}`);
    }

    const identifier = { ...args };
    for (const key of identifier.keys) {
      if ('privateKeyHex' in key) {
        delete key.privateKeyHex;
      }
    }
    state.accountState[account].identifiers[args.did] = identifier;
    await updateSnapState(this.snap, state);
    return true;
  }

  async listDIDs(args: {
    alias?: string;
    provider?: string;
  }): Promise<IIdentifier[]> {
    const state = await getSnapState(this.snap);
    const account = state.currentAccount;
    if (!account) {
      throw Error(`SnapDIDStore - Cannot get current account: ${account}`);
    }

    let result: IIdentifier[] = [];
    for (const key of Object.keys(state.accountState[account].identifiers)) {
      result.push(state.accountState[account].identifiers[key]);
    }

    if (args.alias && !args.provider) {
      result = result.filter((i) => i.alias === args.alias);
    } else if (args.provider && !args.alias) {
      result = result.filter((i) => i.provider === args.provider);
    } else if (args.provider && args.alias) {
      result = result.filter(
        (i) => i.provider === args.provider && i.alias === args.alias,
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
  snap: SnapsGlobalObject;

  constructor(snap: SnapsGlobalObject) {
    super();
    this.snap = snap;
  }

  async queryVC(args: IFilterArgs): Promise<IQueryResult[]> {
    const { filter } = args;
    const state = await getSnapState(this.snap);
    const account = state.currentAccount;
    if (!account) {
      throw Error(`SnapVCStore - Cannot get current account: ${account}`);
    }

    if (filter && filter.type === 'id') {
      try {
        if (state.accountState[account].vcs[filter.filter as string]) {
          let vc = state.accountState[account].vcs[
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
        }
        return [];
      } catch (e) {
        throw new Error(`SnapVCStore - Invalid id for filter=${filter}`);
      }
    }

    if (filter && filter.type === 'vcType') {
      return Object.keys(state.accountState[account].vcs)
        .map((k) => {
          let vc = state.accountState[account].vcs[k] as unknown;
          if (typeof vc === 'string') {
            vc = decodeJWT(vc);
          }
          return {
            metadata: { id: k },
            data: vc,
          };
        })
        .filter((item: any) => {
          return item.data.type?.includes(filter.filter as string);
        });
    }

    if (filter === undefined || (filter && filter.type === 'none')) {
      return Object.keys(state.accountState[account].vcs).map((k) => {
        let vc = state.accountState[account].vcs[k] as unknown;
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
      const objects = Object.keys(state.accountState[account].vcs).map((k) => {
        let vc = state.accountState[account].vcs[k] as unknown;
        if (typeof vc === 'string') {
          vc = decodeJWT(vc);
        }
        return {
          metadata: { id: k },
          data: vc,
        };
      });
      const filteredObjects = jsonpath.query(objects, filter.filter as string);
      return filteredObjects as IQueryResult[];
    }
    return [];
  }

  async saveVC(args: {
    data: W3CVerifiableCredential;
    id: string;
  }): Promise<string> {
    // TODO check if VC is correct type

    const { data: vc, id } = args;
    const state = await getSnapState(this.snap);
    const account = state.currentAccount;
    if (!account) {
      throw Error(`SnapVCStore - Cannot get current account: ${account}`);
    }

    const newId = id || uuidv4();
    state.accountState[account].vcs[newId] = vc;
    await updateSnapState(this.snap, state);
    return newId;
  }

  async deleteVC({ id }: { id: string }): Promise<boolean> {
    const state = await getSnapState(this.snap);
    const account = state.currentAccount;
    if (!account) {
      throw Error(`SnapVCStore - Cannot get current account: ${account}`);
    }

    if (!state.accountState[account].vcs[id]) {
      throw Error(`SnapVCStore - VC ID '${id}' not found`);
    }

    delete state.accountState[account].vcs[id];
    await updateSnapState(this.snap, state);
    return true;
  }

  public async clearVCs(_args: IFilterArgs): Promise<boolean> {
    const state = await getSnapState(this.snap);
    const account = state.currentAccount;
    if (!account) {
      throw Error(`SnapVCStore - Cannot get current account: ${account}`);
    }

    state.accountState[account].vcs = {};
    await updateSnapState(this.snap, state);
    return true;
  }
}
