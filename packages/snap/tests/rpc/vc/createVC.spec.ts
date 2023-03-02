import { MetaMaskInpageProvider } from '@metamask/providers';
import { SnapsGlobalObject } from '@metamask/snaps-types';
import { IdentitySnapParams, IdentitySnapState } from '../../../src/interfaces';
import { connectHederaAccount } from '../../../src/rpc/hedera/connectHederaAccount';
import { createVC } from '../../../src/rpc/vc/createVC';
import {
  getDefaultSnapState,
  hederaPrivateKey,
} from '../../testUtils/constants';
import { createMockSnap, SnapMock } from '../../testUtils/snap.mock';

describe('createVC', () => {
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

  it('should create VC', async () => {
    const vcCreatedResult = await createVC(identitySnapParams, {
      vcValue: { prop: 10 },
    });
    console.log(JSON.stringify(vcCreatedResult));
    expect(vcCreatedResult.length).toBe(1);
    expect(vcCreatedResult[0].id).not.toBeUndefined();

    expect.assertions(2);
  });

  it('should throw exception if user refused confirmation', async () => {
    (identitySnapParams.snap as SnapMock).rpcMocks.snap_dialog.mockReturnValue(
      false,
    );

    await expect(
      createVC(identitySnapParams, { vcValue: { prop: 10 } }),
    ).rejects.toThrowError();
    expect.assertions(1);
  });
});
