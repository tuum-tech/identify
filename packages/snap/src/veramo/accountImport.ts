import { BIP44CoinTypeNode } from '@metamask/key-tree';
import { MetaMaskInpageProvider } from '@metamask/providers';
import { SnapsGlobalObject } from '@metamask/snaps-types';
import { IIdentifier, MinimalImportableKey } from '@veramo/core';
import { validHederaChainID } from '../hedera/config';
import { Account, IdentitySnapState } from '../interfaces';
import { getCurrentNetwork } from '../snap/network';
import { getAccountStateByCoinType, updateSnapState } from '../snap/state';
import { DEFAULTCOINTYPE, HEDERACOINTYPE } from '../types/constants';
import { KeyPair } from '../types/crypto';
import { getKeyPair } from '../utils/hederaUtils';
import {
  getAddressKeyDeriver,
  getKeysFromAddressIndex,
  snapGetKeysFromAddress,
} from '../utils/keyPair';
import { convertChainIdFromHex } from '../utils/network';
import { getVeramoAgent } from './agent';

/**
 * Veramo Import metamask account.
 *
 * @param identitySnapParams - Identity snap params.
 * @param agent - Veramo agent.
 * @returns Identifier.
 */
export async function veramoImportMetaMaskAccount(
  snap: SnapsGlobalObject,
  state: IdentitySnapState,
  metamask: MetaMaskInpageProvider,
  evmAddress: string,
  pKey?: string,
): Promise<Account> {
  const chainId = await getCurrentNetwork(metamask);

  let privateKey: string;
  let publicKey: string;
  let address: string = evmAddress;

  if (pKey) {
    try {
      const keyPair: KeyPair = await getKeyPair(pKey);
      privateKey = keyPair.privateKey;
      publicKey = keyPair.publicKey;
    } catch (error) {
      console.log(
        `Private key was passed but it is not a valid private key: ${error}`,
      );
      throw new Error(
        `Private key was passed but it is not a valid private key: ${error}`,
      );
    }
  } else {
    let coinType = DEFAULTCOINTYPE;
    if (validHederaChainID(chainId)) {
      coinType = HEDERACOINTYPE;
    }

    const bip44CoinTypeNode = await getAddressKeyDeriver(snap, coinType);
    let res: any;
    if (validHederaChainID(chainId)) {
      res = await getKeysFromAddressIndex(bip44CoinTypeNode, 0);
    } else {
      res = await snapGetKeysFromAddress(
        bip44CoinTypeNode as BIP44CoinTypeNode,
        state,
        address,
        snap,
      );
    }

    if (!res) {
      console.log('Failed to get private keys from Metamask account');
      throw new Error('Failed to get private keys from Metamask account');
    }
    privateKey = res.privateKey.split('0x')[1];
    publicKey = res.publicKey.split('0x')[1];
    address = res.address;
  }

  address = address.toLowerCase();
  console.log('privateKey: ', privateKey);
  console.log('publicKey: ', publicKey);
  console.log('address: ', address);

  const accountState = await getAccountStateByCoinType(state, address);
  console.log('accountState: ', accountState);
  const method = accountState.accountConfig.identity.didMethod;

  let did = '';
  if (method === 'did:pkh') {
    did = `did:pkh:eip155:${convertChainIdFromHex(chainId)}:${address}`;
  }
  if (!did) {
    console.log('Failed to generate DID');
    throw new Error('Failed to generate DID');
  }

  state.currentAccount.evmAddress = address;
  /*   const newState = cloneDeep(state);
  newState.currentAccount = account; */

  // Get Veramo agent
  const agent = await getVeramoAgent(snap, state);
  const controllerKeyId = `metamask-${address}`;
  console.log(
    `Importing using did=${did}, provider=${method}, controllerKeyId=${controllerKeyId}...`,
  );

  let identifier: IIdentifier;
  // Get identifier if it exists
  try {
    identifier = await agent.didManagerGet({
      did: did,
    });
  } catch (error) {
    identifier = await agent.didManagerImport({
      did,
      provider: method,
      controllerKeyId,
      keys: [
        {
          kid: controllerKeyId,
          type: 'Secp256k1',
          kms: 'snap',
          privateKeyHex: privateKey,
          publicKeyHex: publicKey,
        } as MinimalImportableKey,
      ],
    });
  }
  await updateSnapState(snap, state);
  console.log('Imported successfully');

  return {
    evmAddress: address,
    method,
    identifier,
    privateKey,
    publicKey,
  } as Account;
}
