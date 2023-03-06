import { MetaMaskInpageProvider } from '@metamask/providers';
import { SnapsGlobalObject } from '@metamask/snaps-types';
import { IdentitySnapParams, IdentitySnapState } from '../../src/interfaces';
import { connectHederaAccount } from '../../src/rpc/hedera/connectHederaAccount';
import { saveVC } from '../../src/rpc/vc/saveVC';
import { SaveVCRequestParams } from '../../src/types/params';
import { getAgent } from '../../src/veramo/agent';
import { getDefaultSnapState, hederaPrivateKey } from '../testUtils/constants';
import { getDefaultCredential } from '../testUtils/helper';
import { createMockSnap, SnapMock } from '../testUtils/snap.mock';

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
      metamask,
      snap: snapMock,
      state: snapState,
    };

    (identitySnapParams.snap as SnapMock).rpcMocks.snap_dialog.mockReturnValue(
      hederaPrivateKey,
    );

    (identitySnapParams.snap as SnapMock).rpcMocks.eth_chainId.mockReturnValue(
      '0x128',
    );

    await connectHederaAccount(snapMock, snapState, metamask, '0.0.15215');
  });

  it('should succeed saving passing VC', async () => {
    const agent = await getAgent(snapMock);

    (identitySnapParams.snap as SnapMock).rpcMocks.snap_dialog.mockReturnValue(
      true,
    );

    const identifier = await agent.didManagerCreate({
      kms: 'snap',
      provider: 'did:pkh',
      options: { chainId: '1' },
    });
    snapState.accountState[snapState.currentAccount].identifiers[
      identifier.did
    ] = identifier;

    const credential = await getDefaultCredential(agent, identifier.did);
    const params: SaveVCRequestParams = {
      verifiableCredential: credential,
      options: {},
    };

    const result = await saveVC(identitySnapParams, params);
    expect(result.length).toBe(1);

    expect.assertions(1);
  });
});
