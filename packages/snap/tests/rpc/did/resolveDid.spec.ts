import { MetaMaskInpageProvider } from '@metamask/providers';
import { SnapsGlobalObject } from '@metamask/snaps-types';
import { IdentitySnapParams, IdentitySnapState } from 'src/interfaces';
import { resolveDID } from '../../../src/rpc/did/resolveDID';
import { connectHederaAccount } from '../../../src/rpc/hedera/connectHederaAccount';
import { exampleDIDPkh, getDefaultSnapState } from '../../testUtils/constants';
import { createMockSnap, SnapMock } from '../../testUtils/snap.mock';

describe('resolveDID', () => {
  let identitySnapParams: IdentitySnapParams;
  let snapState: IdentitySnapState;
  let snapMock: SnapsGlobalObject & SnapMock;
  let metamask: MetaMaskInpageProvider;

  beforeEach(async () => {
    snapState = getDefaultSnapState();
    snapMock = createMockSnap();
    metamask = snapMock as unknown as MetaMaskInpageProvider;
    identitySnapParams = {
      metamask: metamask,
      snap: snapMock,
      state: snapState,
    };

    let privateKey =
      '2386d1d21644dc65d4e4b9e2242c5f155cab174916cbc46ad85622cdaeac835c';
    (identitySnapParams.snap as SnapMock).rpcMocks.snap_dialog.mockReturnValue(
      privateKey,
    );
    (identitySnapParams.snap as SnapMock).rpcMocks.eth_chainId.mockReturnValue(
      '0x128',
    );

    let connected = await connectHederaAccount(
      snapMock,
      snapState,
      metamask,
      '0.0.15215',
    );
  });
  it('should succeed returning current did resolved', async () => {
    let resolvedDid = await resolveDID(identitySnapParams, exampleDIDPkh);

    console.log('resolved did:' + JSON.stringify(resolvedDid));
    let id = resolvedDid?.didDocument!['id'];

    expect(id).toEqual(exampleDIDPkh);

    expect.assertions(1);
  });

  it('should resolve current did when didUrl undefined', async () => {
    let resolvedDid = await resolveDID(identitySnapParams, undefined);

    let id = resolvedDid?.didDocument!['id'];

    expect(id).toEqual(
      snapState.accountState['0x7d871f006d97498ea338268a956af94ab2e65cdd']
        .identifiers[id as string].did,
    );

    expect.assertions(1);
  });
});
