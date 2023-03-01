import { MetaMaskInpageProvider } from '@metamask/providers';
import { SnapsGlobalObject } from '@metamask/snaps-types';
import { IdentitySnapParams, IdentitySnapState } from '../../../src/interfaces';
import { getDid } from '../../../src/rpc/did/getDID';
import { connectHederaAccount } from '../../../src/rpc/hedera/connectHederaAccount';
import { getDefaultSnapState, hederaAddress } from '../../testUtils/constants';
import { createMockSnap, SnapMock } from '../../testUtils/snap.mock';

describe('getDID', () => {
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

    const privateKey =
      '2386d1d21644dc65d4e4b9e2242c5f155cab174916cbc46ad85622cdaeac835c';
    (identitySnapParams.snap as SnapMock).rpcMocks.snap_dialog.mockReturnValue(
      privateKey,
    );

    (identitySnapParams.snap as SnapMock).rpcMocks.eth_chainId.mockReturnValue(
      '0x128',
    );

    await connectHederaAccount(snapMock, snapState, metamask, '0.0.15215');
  });

  it('should return did:pkh', async () => {
    await expect(getDid(identitySnapParams)).resolves.toBe(
      `did:pkh:eip155:296:${hederaAddress}`,
    );

    expect.assertions(1);
  });
});
