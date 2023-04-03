import {
  BIP44CoinTypeNode,
  getBIP44AddressKeyDeriver,
} from '@metamask/key-tree';
import { SnapsGlobalObject } from '@metamask/snaps-types';
import { ethers } from 'ethers';
import { IdentitySnapState } from '../interfaces';
import { getAccountStateByCoinType, updateSnapState } from '../snap/state';
import { DEFAULTCOINTYPE } from '../types/constants';

/**
 * Function to get account index.
 *
 * @param state - IdentitySnapState.
 * @param account - Account.
 * @returns Account index.
 */
export async function getAccountIndex(
  state: IdentitySnapState,
  account: string,
): Promise<number | undefined> {
  const accountState = await getAccountStateByCoinType(state, account);

  if (accountState.index) {
    return accountState.index;
  }
  return undefined;
}

/**
 * Function to set account index.
 *
 * @param snap - Snap.
 * @param state - IdentitySnapState.
 * @param account - Account.
 * @param index - New account index.
 */
export async function setAccountIndex(
  snap: SnapsGlobalObject,
  state: IdentitySnapState,
  account: string,
  index: number,
) {
  const accountState = await getAccountStateByCoinType(state, account);
  // eslint-disable-next-line no-param-reassign
  accountState.index = index;
  await updateSnapState(snap, state);
}

/**
 * Function to get address key deriver.
 *
 * @param snap - Snap.
 * @param coinType - Coin type.
 * @returns BIP44CoinTypeNode.
 */
export async function getAddressKeyDeriver(
  snap: SnapsGlobalObject,
  coinType?: number,
) {
  let ct = coinType;
  if (ct === undefined) {
    ct = DEFAULTCOINTYPE;
  }

  const bip44CoinTypeNode = (await snap.request({
    method: 'snap_getBip44Entropy',
    params: {
      coinType: ct,
    },
  })) as BIP44CoinTypeNode;
  return bip44CoinTypeNode;
}

/**
 * Function to get address key.
 *
 * @param bip44CoinTypeNode - BIP44CoinTypeNode.
 * @param addressIndex - Address index.
 * @returns Address key.
 */
export async function getAddressKey(
  bip44CoinTypeNode: BIP44CoinTypeNode,
  addressIndex = 0,
) {
  const keyDeriver = await getBIP44AddressKeyDeriver(bip44CoinTypeNode);
  const derivedKey = await keyDeriver(addressIndex);

  const { privateKey, chainCode } = derivedKey;
  const addressKey = `${privateKey as string}${chainCode.split('0x')[1]}`;
  if (privateKey === undefined) {
    return null;
  }
  return {
    privateKey,
    originalAddressKey: addressKey,
    derivationPath: keyDeriver.path,
  };
}

export const getKeysFromAddressIndex = async (
  bip44CoinTypeNode: BIP44CoinTypeNode,
  addressIndex: number | undefined,
) => {
  if (addressIndex === undefined) {
    throw new Error('Err, index undefined');
  }

  const result = await getAddressKey(bip44CoinTypeNode, addressIndex);
  if (result === null) {
    return null;
  }
  const { privateKey, derivationPath } = result;
  const wallet = new ethers.Wallet(privateKey);

  return {
    privateKey,
    publicKey: wallet.publicKey,
    address: wallet.address,
    addressIndex,
    derivationPath,
  };
};

export const getKeysFromAddress = async (
  bip44CoinTypeNode: BIP44CoinTypeNode,
  account: string,
  maxScan = 20,
  addressIndex?: number,
): Promise<KeysType | null> => {
  if (addressIndex !== undefined) {
    return getKeysFromAddressIndex(bip44CoinTypeNode, addressIndex);
  }

  for (let i = 0; i < maxScan; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    const keys = await getKeysFromAddressIndex(bip44CoinTypeNode, i);
    if (keys && keys.address.toUpperCase() === account.toUpperCase()) {
      return keys;
    }
  }

  return null;
};

export const snapGetKeysFromAddress = async (
  bip44CoinTypeNode: BIP44CoinTypeNode,
  state: IdentitySnapState,
  account: string,
  snap: SnapsGlobalObject,
  maxScan = 20,
): Promise<KeysType | null> => {
  const addressIndex = await getAccountIndex(state, account);

  if (addressIndex) {
    return await getKeysFromAddress(
      bip44CoinTypeNode,
      account,
      maxScan,
      addressIndex,
    );
  }
  const res = await getKeysFromAddress(bip44CoinTypeNode, account, maxScan);
  if (res) {
    await setAccountIndex(snap, state, account, res.addressIndex);
    return res;
  }

  return null;
};

export type KeysType = {
  privateKey: string;
  publicKey: string;
  address: string;
  addressIndex: number;
  derivationPath: string;
};
