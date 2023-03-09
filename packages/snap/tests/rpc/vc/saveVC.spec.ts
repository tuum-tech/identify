import { MetaMaskInpageProvider } from '@metamask/providers';
import { SnapsGlobalObject } from '@metamask/snaps-types';
import { IdentitySnapParams, IdentitySnapState } from '../../../src/interfaces';
import { connectHederaAccount } from '../../../src/rpc/hedera/connectHederaAccount';
import { saveVC } from '../../../src/rpc/vc/saveVC';
import { SaveVCRequestParams } from '../../../src/types/params';
import { VeramoAgent } from '../../../src/veramo/agent';
import { getDefaultSnapState, hederaPrivateKey } from '../../testUtils/constants';
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

    (identitySnapParams.snap as SnapMock).rpcMocks.snap_dialog.mockReturnValue(
      hederaPrivateKey,
    );
    (identitySnapParams.snap as SnapMock).rpcMocks.eth_chainId.mockReturnValue(
      '0x128',
    );

    await connectHederaAccount(
      snapMock,
      snapState,
      metamask,
      '0.0.15215',
    );
  });

  it('should succeed saving passing VC', async () => {
    // Get Veramo agent
    const agent = new VeramoAgent(identitySnapParams);

    (identitySnapParams.snap as SnapMock).rpcMocks.snap_dialog.mockReturnValue(
      true,
    );

    let identifier = await agent.agent.didManagerCreate({
      kms: 'snap',
      provider: 'did:pkh',
      options: { chainId: '1' },
    });
    snapState.accountState[snapState.currentAccount].identifiers[
      identifier.did
    ] = identifier;

    let credential = await getDefaultCredential(agent);
    let params: SaveVCRequestParams = {
      verifiableCredentials: [credential],
      options: {},
    };

    let result = await saveVC(identitySnapParams, params);
    expect(result.length).toBe(1);

    expect.assertions(1);
  });

  it('should succeed saving 2 VCs', async () => {
    // Get Veramo agent
    const agent = new VeramoAgent(identitySnapParams);

    (identitySnapParams.snap as SnapMock).rpcMocks.snap_dialog.mockReturnValue(
      true,
    );

    let identifier = await agent.agent.didManagerCreate({
      kms: 'snap',
      provider: 'did:pkh',
      options: { chainId: '1' },
    });
    snapState.accountState[snapState.currentAccount].identifiers[
      identifier.did
    ] = identifier;

    let credential1 = await getDefaultCredential(agent, "type1");
    let credential2 = await getDefaultCredential(agent, "type2");
    let params: SaveVCRequestParams = {
      verifiableCredentials: [credential1, credential2],
      options: {},
    };

    let result = await saveVC(identitySnapParams, params);
    expect(result.length).toBe(2);

    expect.assertions(1);
  });
});
