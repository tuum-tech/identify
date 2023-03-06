import { BIP44CoinTypeNode } from '@metamask/key-tree';
import { MetaMaskInpageProvider } from '@metamask/providers';
import { SnapsGlobalObject } from '@metamask/snaps-types';
import { IIdentifier, MinimalImportableKey } from '@veramo/core';
import { validHederaChainID } from '../hedera/config';
import { IdentitySnapState } from '../interfaces';
import { getCurrentNetwork } from '../snap/network';
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

  const keyPair: KeyPair = { privateKey: '', publicKey: '' };
  // Use metamask private keys if it's not hedera network since we can directly use those
  // unlike for hedera where we request the user for their private key and accountId while configuring
  const chainId = await getCurrentNetwork(metamask);
  if (validHederaChainID(chainId)) {
    // TODO: This is a very hacky way to retrieve private key for hedera account. Try to use veramo agent if possible
    try {
      const privateKey =
        state.accountState[state.currentAccount].snapPrivateKeyStore[
          controllerKeyId
        ].privateKeyHex;
      const kp = await getKeyPair(privateKey);
      keyPair.privateKey = kp.privateKey;
      keyPair.publicKey = kp.publicKey;
    } catch (error) {
      console.log(
        `Failed to get private keys from Metamask account for Hedera network. Error: ${error}`,
      );
      throw new Error(
        `Failed to get private keys from Metamask account for Hedera network. Error: ${error}`,
      );
    }
  } else {
    const bip44CoinTypeNode = await getAddressKeyDeriver(snap);
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
    keyPair.privateKey = res.privateKey.split('0x')[1];
    keyPair.publicKey = res.publicKey.split('0x')[1];
  }

  const identifier = await agent.didManagerImport({
    did,
    provider: method,
    controllerKeyId,
    keys: [
      {
        kid: controllerKeyId,
        type: 'Secp256k1',
        kms: 'snap',
        privateKeyHex: keyPair.privateKey,
        publicKeyHex: keyPair.publicKey,
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
