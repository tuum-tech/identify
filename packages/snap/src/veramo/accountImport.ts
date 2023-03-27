import { BIP44CoinTypeNode } from '@metamask/key-tree';
import { MetaMaskInpageProvider } from '@metamask/providers';
import { SnapsGlobalObject } from '@metamask/snaps-types';
import { IIdentifier, MinimalImportableKey } from '@veramo/core';
import { isValidHederaAccountInfo } from '../hedera';
import { getHederaNetwork, validHederaChainID } from '../hedera/config';
import {
  Account,
  AccountViaPrivateKey,
  IdentitySnapState,
} from '../interfaces';
import { requestHederaAccountId } from '../snap/dialog';
import { getCurrentNetwork } from '../snap/network';
import {
  getAccountStateByCoinType,
  getCurrentCoinType,
  initAccountState,
  updateSnapState,
} from '../snap/state';
import { getAddressKeyDeriver, snapGetKeysFromAddress } from '../utils/keyPair';
import { convertChainIdFromHex } from '../utils/network';
import { getHederaAccountIfExists } from '../utils/params';
import { getVeramoAgent } from './agent';

/**
 * Veramo Import metamask account.
 *
 * @param snap - SnapsGlobalObject.
 * @param state - IdentitySnapState.
 * @param metamask - MetaMaskInpageProvider.
 * @param evmAddress - Ethereum address.
 * @param accountViaPrivateKey - Account info if imported via private key directly(only used for Hedera accounts currently).
 * @returns Account.
 */
export async function veramoImportMetaMaskAccount(
  snap: SnapsGlobalObject,
  state: IdentitySnapState,
  metamask: MetaMaskInpageProvider,
  evmAddress: string,
  accountViaPrivateKey?: AccountViaPrivateKey,
): Promise<Account> {
  const chainId = await getCurrentNetwork(metamask);

  let privateKey: string;
  let publicKey: string;
  let address: string = evmAddress.toLowerCase();
  let hederaAccountId = '';

  if (accountViaPrivateKey) {
    privateKey = accountViaPrivateKey.privateKey;
    publicKey = accountViaPrivateKey.publicKey;
    address = accountViaPrivateKey.address.toLowerCase();
    if (validHederaChainID(chainId)) {
      hederaAccountId = accountViaPrivateKey.extraData as string;
    }
  } else {
    const bip44CoinTypeNode = await getAddressKeyDeriver(snap);
    const res = await snapGetKeysFromAddress(
      bip44CoinTypeNode as BIP44CoinTypeNode,
      state,
      address,
      snap,
    );

    if (!res) {
      console.log('Failed to get private keys from Metamask account');
      throw new Error('Failed to get private keys from Metamask account');
    }
    privateKey = res.privateKey.split('0x')[1];
    publicKey = res.publicKey;
    address = res.address.toLowerCase();
    if (validHederaChainID(chainId)) {
      hederaAccountId = await getHederaAccountIfExists(
        state,
        undefined,
        address,
      );
      if (!hederaAccountId) {
        hederaAccountId = await requestHederaAccountId(snap);
      }
    }
  }

  // Initialize if not there
  const coinType = (await getCurrentCoinType()).toString();
  if (address && !(address in state.accountState[coinType])) {
    console.log(
      `The address ${address} has NOT yet been configured in the Identity Snap. Configuring now...`,
    );
    await initAccountState(snap, state, coinType, address);
  }

  if (validHederaChainID(chainId)) {
    let hederaClient = await isValidHederaAccountInfo(
      privateKey,
      hederaAccountId,
      getHederaNetwork(chainId),
    );

    if (hederaClient === null) {
      console.error(
        `Could not retrieve hedera account info using the accountId '${hederaAccountId}'`,
      );
      throw new Error(
        `Could not retrieve hedera account info using the accountId '${hederaAccountId}'`,
      );
    }

    // eslint-disable-next-line
    state.accountState[coinType][address].extraData = hederaAccountId;
  }

  const accountState = await getAccountStateByCoinType(state, address);
  const method = accountState.accountConfig.identity.didMethod;

  let did = '';
  if (method === 'did:pkh') {
    did = `did:pkh:eip155:${convertChainIdFromHex(chainId)}:${address}`;
  }

  if (!did) {
    console.log('Failed to generate DID');
    throw new Error('Failed to generate DID');
  }

  // eslint-disable-next-line
  state.currentAccount.evmAddress = address;

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
      did,
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
