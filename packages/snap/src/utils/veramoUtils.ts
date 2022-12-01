import { SnapProvider } from '@metamask/snap-types';
import { IIdentifier, MinimalImportableKey } from '@veramo/core';
import { IdentitySnapState } from '../interfaces';
import { getAgent } from '../veramo/setup';
import { getCurrentDid } from './didUtils';

/* eslint-disable */
export async function veramoImportMetaMaskAccount(
  wallet: SnapProvider,
  state: IdentitySnapState
): Promise<string> {
  const agent = await getAgent(wallet, state);
  const method =
    state.accountState[state.currentAccount].accountConfig.identity.didMethod;
  const did = await getCurrentDid(wallet, state);
  const identifiers = await agent.didManagerFind();

  let exists = false;
  identifiers.forEach((id: IIdentifier) => {
    if (id.did === did) {
      exists = true;
    }
  });

  if (exists) {
    console.log('DID already exists', did);
    return did;
  }

  console.log('Importing...');
  const controllerKeyId = `metamask-${state.currentAccount}`;
  await agent.didManagerImport({
    did,
    provider: method,
    controllerKeyId,
    keys: [
      {
        kid: controllerKeyId,
        type: 'Secp256k1',
        kms: 'web3',
        privateKeyHex: '',
        publicKeyHex: '',
        meta: {
          provider: 'metamask',
          account: state.currentAccount.toLowerCase(),
          algorithms: ['eth_signMessage', 'eth_signTypedData'],
        },
      } as MinimalImportableKey,
    ],
  });

  console.log('imported successfully');
  return did;
}
