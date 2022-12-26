import { VCQuery } from '@blockchain-lab-um/ssi-snap-types';
import { SnapProvider } from '@metamask/snap-types';
import {
  IIdentifier,
  MinimalImportableKey,
  VerifiableCredential,
} from '@veramo/core';
import { IdentitySnapState } from '../interfaces';
import { availableVCStores } from '../veramo/plugins/availableVCStores';
import { getAgent } from '../veramo/setup';
import { getCurrentDid } from './didUtils';

/* eslint-disable */
export async function veramoListVCs(
  wallet: SnapProvider,
  state: IdentitySnapState,
  vcStore: typeof availableVCStores[number],
  query?: VCQuery
): Promise<VerifiableCredential[]> {
  const agent = await getAgent(wallet, state);
  const vcsSnap = await agent.listVCS({ store: 'snap', query: query });

  if (vcStore === 'ceramic') {
    const vcsCeramic = await agent.listVCS({ store: 'ceramic', query: query });
    return [...vcsSnap.vcs, ...vcsCeramic.vcs];
  }
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
