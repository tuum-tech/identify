import { BIP44CoinTypeNode } from '@metamask/key-tree';
import { MetaMaskInpageProvider } from '@metamask/providers';
import { SnapsGlobalObject } from '@metamask/snaps-types';
import { IIdentifier, MinimalImportableKey } from '@veramo/core';
import { validHederaChainID } from '../hedera/config';
import { IdentitySnapState } from '../interfaces';
import { getCurrentNetwork } from '../snap/network';
import { DEFAULTCOINTYPE, HEDERACOINTYPE } from '../types/constants';
import { KeyPair } from '../types/crypto';
import { getCurrentDid } from '../utils/didUtils';
import { getKeyPair } from '../utils/hederaUtils';
import { getAddressKeyDeriver, snapGetKeysFromAddress } from '../utils/keyPair';
import { Agent } from './agent';

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
  agent: Agent,
): Promise<IIdentifier> {
  const method =
    state.accountState[state.currentAccount].accountConfig.identity.didMethod;
  const did = await getCurrentDid(state, metamask);

  const controllerKeyId = `metamask-${state.currentAccount}`;

  const chainId = await getCurrentNetwork(metamask);
  let coinType = DEFAULTCOINTYPE;
  if (validHederaChainID(chainId)) {
    coinType = HEDERACOINTYPE;
  }

  const bip44CoinTypeNode = await getAddressKeyDeriver(snap, coinType);
  const res = await snapGetKeysFromAddress(
    bip44CoinTypeNode as BIP44CoinTypeNode,
    state,
    state.currentAccount,
    snap,
  );
  if (!res) {
    console.log('Failed to get private keys from Metamask account');
    throw new Error('Failed to get private keys from Metamask account');
  }
  const privateKey = res.privateKey.split('0x')[1];
  const publicKey = res.publicKey.split('0x')[1];

  const identifier = await agent.didManagerImport({
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
  console.log(
    `Importing using did=${did}, provider=${method}, controllerKeyId=${controllerKeyId}...`,
  );

  console.log('imported successfully');
  return identifier;
}

/**
 * Veramo Import Hedera account.
 *
 * @param agent - Veramo agent.
 * @param account - Account.
 * @param privateKey - Private key.
 * @returns Success.
 */
export async function veramoImportHederaAccount(
  agent: Agent,
  account: string,
  privateKey: string,
): Promise<boolean> {
  const controllerKeyId = `metamask-${account}`;
  try {
    const keyPair: KeyPair = await getKeyPair(privateKey);
    await agent.keyManagerImport({
      kid: controllerKeyId,
      kms: 'snap',
      type: 'Secp256k1',
      privateKeyHex: keyPair.privateKey,
      publicKeyHex: keyPair.publicKey,
    });
  } catch (error) {
    console.log(`Could not connect to Hedera Account: ${error}`);
    return false;
  }
  return true;
}
