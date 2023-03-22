import { MetaMaskInpageProvider } from '@metamask/providers';
import { SnapsGlobalObject } from '@metamask/snaps-types';
import { onRpcRequest } from '../../../src';
import { convertChainIdFromHex } from '../../../src/utils/network';
import {
  ETH_ADDRESS,
  ETH_CHAIN_ID,
  getDefaultSnapState
} from '../../testUtils/constants';
import { getRequestParams } from '../../testUtils/helper';
import { buildMockSnap, SnapMock } from '../../testUtils/snap.mock';

describe('getDID', () => {
  let snapMock: SnapsGlobalObject & SnapMock;
  let metamask: MetaMaskInpageProvider;

  let currentDID = '';

  beforeAll(async () => {
    snapMock = buildMockSnap(ETH_CHAIN_ID, ETH_ADDRESS);
    metamask = snapMock as unknown as MetaMaskInpageProvider;

    global.snap = snapMock;
    global.ethereum = metamask;
  });

  beforeEach(async () => {
    snapMock.rpcMocks.snap_dialog.mockReturnValue(true);
    snapMock.rpcMocks.snap_manageState.mockReturnValue(getDefaultSnapState());
    snapMock.rpcMocks.snap_manageState('update', getDefaultSnapState());
  });

  it('should return did:pkh', async () => {
    const getDIDRequestParams = getRequestParams('getDID', {});
    currentDID = (await onRpcRequest({
      origin: 'tests',
      request: getDIDRequestParams as any,
    })) as string;
    expect(currentDID).toBe(`did:pkh:eip155:${convertChainIdFromHex(ETH_CHAIN_ID)}:${ETH_ADDRESS}`);
  });
});
