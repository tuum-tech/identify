/* eslint-disable */

import { MetaMaskInpageProvider } from '@metamask/providers';
import { SnapsGlobalObject } from '@metamask/snaps-types';
import { IdentitySnapParams, IdentitySnapState } from '../../../src/interfaces';
import { connectHederaAccount } from '../../../src/rpc/hedera/connectHederaAccount';
import { saveVC } from '../../../src/rpc/vc/saveVC';
import { SaveVCRequestParams } from '../../../src/types/params';
import { getAgent } from '../../../src/veramo/agent';
import { getDefaultSnapState } from '../../testUtils/constants';
import { getDefaultCredential } from '../../testUtils/helper';
import { createMockSnap, SnapMock } from '../../testUtils/snap.mock';

describe('saveVC', () => {
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

  it('should succeed saving passing VC', async () => {
    let agent = await getAgent(snapMock);

    (identitySnapParams.snap as SnapMock).rpcMocks.snap_dialog.mockReturnValue(
      true,
    );

    let identifier = await agent.didManagerCreate({
      kms: 'snap',
      provider: 'did:pkh',
      options: { chainId: '1' },
    });
    snapState.accountState[snapState.currentAccount].identifiers[
      identifier.did
    ] = identifier;

    let credential = await getDefaultCredential(agent, identifier.did);
    let params: SaveVCRequestParams = {
      verifiableCredential: credential,
      options: {},
    };

    let result = await saveVC(identitySnapParams, params);
    expect(result.length).toBe(1);

    expect.assertions(1);
  });
});
