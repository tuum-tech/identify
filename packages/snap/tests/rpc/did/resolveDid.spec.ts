import { MetaMaskInpageProvider } from '@metamask/providers';
import { SnapsGlobalObject } from '@metamask/snaps-types';
import { DIDResolutionResult } from 'did-resolver';
import { onRpcRequest } from '../../../src';
import {
  ETH_ADDRESS,
  ETH_CHAIN_ID,
  getDefaultSnapState,
} from '../../testUtils/constants';
import { getRequestParams } from '../../testUtils/helper';
import { buildMockSnap, SnapMock } from '../../testUtils/snap.mock';

describe('resolveDID', () => {
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

    const getDIDRequestParams = getRequestParams('getDID', {});

    currentDID = (await onRpcRequest({
      origin: 'tests',
      request: getDIDRequestParams as any,
    })) as string;
  });

  it('should succeed returning current did resolved', async () => {
    const resolveDIDRequestParams = getRequestParams('resolveDID', {});

    const resolvedDID = (await onRpcRequest({
      origin: 'tests',
      request: resolveDIDRequestParams as any,
    })) as DIDResolutionResult;

    expect(resolvedDID.didDocument?.id).toBe(currentDID);
    expect.assertions(1);
  });

  // it('should resolve current did when didUrl undefined', async () => {
  //   const resolvedDid = await resolveDID(identitySnapParams, undefined);

  //   const id = resolvedDid?.didDocument?.id;

  //   expect(id).toEqual(
  //     snapState.accountState['0x7d871f006d97498ea338268a956af94ab2e65cdd']
  //       .identifiers[id as string].did,
  //   );

  //   expect.assertions(1);
  // });
});
