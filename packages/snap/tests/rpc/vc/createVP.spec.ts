import { MetaMaskInpageProvider } from '@metamask/providers';
import { SnapsGlobalObject } from '@metamask/snaps-types';
import { VerifiablePresentation, W3CVerifiableCredential } from '@veramo/core';
import { IDataManagerSaveResult } from 'src/plugins/veramo/verfiable-creds-manager';
import { onRpcRequest } from '../../../src';
import {
  ETH_ADDRESS,
  ETH_CHAIN_ID,
  getDefaultSnapState
} from '../../testUtils/constants';
import { getRequestParams } from '../../testUtils/helper';
import { buildMockSnap, SnapMock } from '../../testUtils/snap.mock';

describe('createVP', () => {
  let snapMock: SnapsGlobalObject & SnapMock;
  let metamask: MetaMaskInpageProvider;

  const vcs: W3CVerifiableCredential[] = [];

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

    const createVcRequest1 = getRequestParams('createVC', {
      vcValue: { prop: 10 },
      credTypes: ['Login'],
    });

    const createVcRequest2 = getRequestParams('createVC', {
      vcValue: { prop: 20 },
      credTypes: ['NotLogin'],
    });

    const createVcResponse1: IDataManagerSaveResult[] = (await onRpcRequest({
      origin: 'tests',
      request: createVcRequest1 as any,
    })) as IDataManagerSaveResult[];
    const createVcResponse2: IDataManagerSaveResult[] = (await onRpcRequest({
      origin: 'tests',
      request: createVcRequest2 as any,
    })) as IDataManagerSaveResult[];

    vcs.push(createVcResponse1[0].id);
    vcs.push(createVcResponse2[0].id);
  });

  it('should succeed creating VP from 1 VC', async () => {
    const createVpRequest = getRequestParams('createVP', {
      vcs: [vcs[0] as string],
    });

    const presentation = (await onRpcRequest({
      origin: 'tests',
      request: createVpRequest as any,
    })) as VerifiablePresentation;
    expect(presentation).not.toBeUndefined();
    expect.assertions(1);
  });

  it('should succeed creating VP from 2 VCs', async () => {
    const createVpRequest = getRequestParams('createVP', {
      vcs,
    });

    const presentation = (await onRpcRequest({
      origin: 'tests',
      request: createVpRequest as any,
    })) as VerifiablePresentation;
    expect(presentation).not.toBeUndefined();
    expect(presentation.verifiableCredential?.length).toBe(2);
    expect.assertions(2);
  });

  it.skip('should throw error when user rejects confirm', async () => {
    snapMock.rpcMocks.snap_dialog.mockReturnValue(false);

    const createVpRequest = getRequestParams('createVP', {
      vcs: [vcs[0] as string],
    });

    await expect(
      onRpcRequest({
        origin: 'tests',
        request: createVpRequest as any,
      }),
    ).rejects.toThrowError();
    expect.assertions(1);
  });
});
