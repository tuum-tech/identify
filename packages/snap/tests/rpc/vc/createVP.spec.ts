/* eslint-disable */

import { MetaMaskInpageProvider } from '@metamask/providers';
import { SnapsGlobalObject } from '@metamask/snaps-types';
import { IdentitySnapParams, IdentitySnapState } from '../../../src/interfaces';
import { connectHederaAccount } from '../../../src/rpc/hedera/connectHederaAccount';
import { createVC } from '../../../src/rpc/vc/createVC';
import { createVP } from '../../../src/rpc/vc/createVP';
import { getDefaultSnapState } from '../../testUtils/constants';
import { createMockSnap, SnapMock } from '../../testUtils/snap.mock';

describe('createVP', () => {
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
  it('should succeed creating VP from 1 VC', async () => {
    // Setup snap confirm return
    (identitySnapParams.snap as SnapMock).rpcMocks.snap_dialog.mockReturnValue(
      true,
    );

    let createCredentialResult = await createVC(identitySnapParams, {
      vcValue: { name: 'Diego' },
      credTypes: ['Login'],
    });

    // Act and assert
    await expect(
      createVP(identitySnapParams, {
        vcs: [createCredentialResult[0].id as string],
      }),
    ).resolves.not.toBeUndefined();

    expect.assertions(1);
  });

  it('should throw error when user rejects confirm', async () => {
    // Setup snap confirm return
    (identitySnapParams.snap as SnapMock).rpcMocks.snap_dialog.mockReturnValue(
      true,
    );

    let createCredentialResult = await createVC(identitySnapParams, {
      vcValue: { name: 'Diego' },
      credTypes: ['Login'],
    });

    (identitySnapParams.snap as SnapMock).rpcMocks.snap_dialog.mockReturnValue(
      false,
    );

    // Act and assert
    await expect(
      createVP(identitySnapParams, {
        vcs: [createCredentialResult[0].id as string],
      }),
    ).rejects.toThrow();

    expect.assertions(1);
  });
});
