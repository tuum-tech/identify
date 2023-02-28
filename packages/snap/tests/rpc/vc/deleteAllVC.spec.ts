import { MetaMaskInpageProvider } from '@metamask/providers';
import { SnapsGlobalObject } from '@metamask/snaps-types';
import { IdentitySnapParams, IdentitySnapState } from '../../../src/interfaces';
import { connectHederaAccount } from '../../../src/rpc/hedera/connectHederaAccount';
import { createVC } from '../../../src/rpc/vc/createVC';
import { deleteAllVCs } from '../../../src/rpc/vc/deleteAllVCs';
import { getDefaultSnapState } from '../../testUtils/constants';
import { createMockSnap, SnapMock } from '../../testUtils/snap.mock';

describe('delete all VC', () => {
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
    (
      identitySnapParams.snap as SnapMock
    ).rpcMocks.snap_dialog.mockReturnValueOnce(privateKey);
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

  it('should delete all VC', async () => {
    (identitySnapParams.snap as SnapMock).rpcMocks.snap_dialog.mockReturnValue(
      true,
    );
    let vcCreatedResult = await createVC(identitySnapParams, {
      vcValue: { prop: 10 },
    });
    expect(vcCreatedResult.length).toBe(1);

    await expect(
      deleteAllVCs(identitySnapParams, {}),
    ).resolves.not.toBeUndefined();

    expect.assertions(2);
  });

  it('should throw exception if user refused confirmation', async () => {
    let snapState: IdentitySnapState = getDefaultSnapState();

    (identitySnapParams.snap as SnapMock).rpcMocks.snap_dialog.mockReturnValue(
      false,
    );

    await expect(
      createVC(identitySnapParams, { vcValue: { prop: 10 } }),
    ).rejects.toThrowError();
  });
});
