import { MetaMaskInpageProvider } from '@metamask/providers';
import { SnapsGlobalObject } from '@metamask/snaps-types';
import { IdentitySnapParams, IdentitySnapState } from '../../../src/interfaces';
import { connectHederaAccount } from '../../../src/rpc/hedera/connectHederaAccount';
import { createVC } from '../../../src/rpc/vc/createVC';
import { getVCs } from '../../../src/rpc/vc/getVCs';
import { removeVC } from '../../../src/rpc/vc/removeVC';
import {
  getDefaultSnapState,
  hederaPrivateKey,
} from '../../testUtils/constants';
import { createMockSnap, SnapMock } from '../../testUtils/snap.mock';

describe('RemoveVC', () => {
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

  it('should remove VC', async () => {
    // Setup
    (identitySnapParams.snap as SnapMock).rpcMocks.snap_dialog.mockReturnValue(
      true,
    );

    // create VC
    await createVC(identitySnapParams, { vcValue: { prop: 10 } });
    let getVcsResult = await getVCs(identitySnapParams, {});

    expect(getVcsResult.length).toBe(1);

    // Remove VC
    const removeVCResult = await removeVC(identitySnapParams, {
      id: getVcsResult[0].metadata.id,
      options: {},
    });
    expect(removeVCResult?.length).toBe(1);

    // redo request
    getVcsResult = await getVCs(identitySnapParams, {});
    expect(getVcsResult.length).toBe(0);

    expect.assertions(3);
  });

  it('should throw exception if user refused confirmation', async () => {
    // Setup
    (identitySnapParams.snap as SnapMock).rpcMocks.snap_dialog.mockReturnValue(
      true,
    );

    // create VC
    await createVC(identitySnapParams, { vcValue: { prop: 10 } });
    const getVcsResult = await getVCs(identitySnapParams, {});

    expect(getVcsResult.length).toBe(1);

    console.log(`res: ${JSON.stringify(getVcsResult)}`);

    (identitySnapParams.snap as SnapMock).rpcMocks.snap_dialog.mockReturnValue(
      false,
    );

    await expect(
      removeVC(identitySnapParams, {
        id: getVcsResult[0].metadata.id,
        options: {},
      }),
    ).rejects.toThrowError();

    expect.assertions(2);
  });
});
