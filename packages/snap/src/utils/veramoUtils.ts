import { SnapProvider } from '@metamask/snap-types';
import {
  IIdentifier,
  MinimalImportableKey,
  VerifiableCredential,
} from '@veramo/core';
import { IdentitySnapState, VCQuery } from '../interfaces';
import { availableVCStores } from '../veramo/plugins/availableVCStores';
import { getAgent } from '../veramo/setup';
import { getCurrentDid } from './didUtils';

/* eslint-disable */
export async function veramoSaveVC(
  wallet: SnapProvider,
  state: IdentitySnapState,
  vc: VerifiableCredential,
  vcStore: typeof availableVCStores[number]
): Promise<boolean> {
  const agent = await getAgent(wallet, state);
  return await agent.saveVC({ store: 'snap', vc });
}

/* eslint-disable */
export async function veramoListVCs(
  wallet: SnapProvider,
  state: IdentitySnapState,
  vcStore: typeof availableVCStores[number], // This is always going to be 'snap' for now
  query?: VCQuery
): Promise<VerifiableCredential[]> {
  const agent = await getAgent(wallet, state);
  const vcsSnap = await agent.listVCS({ store: 'snap', query: query });
  return vcsSnap.vcs;
}

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
