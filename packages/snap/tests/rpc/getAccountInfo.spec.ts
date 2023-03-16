import { MetaMaskInpageProvider } from '@metamask/providers';
import { SnapsGlobalObject } from '@metamask/snaps-types';
import { PublicAccountInfo } from 'src/interfaces';
import { onRpcRequest } from '../../src';
import {
  ETH_ADDRESS,
  ETH_CHAIN_ID,
  getDefaultSnapState,
} from '../testUtils/constants';
import { getRequestParams } from '../testUtils/helper';
import { buildMockSnap, SnapMock } from '../testUtils/snap.mock';

describe('getAccountInfo', () => {
  let snapMock: SnapsGlobalObject & SnapMock;
  let metamask: MetaMaskInpageProvider;

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

  it('getAccountInfo', async () => {
    const accountInfoRequestParams = getRequestParams('getAccountInfo', {});

    const accountInfo = (await onRpcRequest({
      origin: 'tests',
      request: accountInfoRequestParams as any,
    })) as PublicAccountInfo;
    expect(accountInfo.evmAddress).toBe(ETH_ADDRESS);
    expect.assertions(1);
  });
});
