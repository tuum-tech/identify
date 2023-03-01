import { MetaMaskInpageProvider } from '@metamask/providers';
import { SnapsGlobalObject } from '@metamask/snaps-types';
import { IdentitySnapParams, IdentitySnapState } from '../../src/interfaces';
import { switchMethod } from '../../src/rpc/did/switchMethods';
import { connectHederaAccount } from '../../src/rpc/hedera/connectHederaAccount';
import { getDefaultSnapState, hederaPrivateKey } from '../testUtils/constants';
import { createMockSnap, SnapMock } from '../testUtils/snap.mock';

describe('SwitchMethod', () => {
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

  it('should change snap state when switch to did:pkh methods', async () => {
    // setup
    snapState.accountState[
      snapState.currentAccount
    ].accountConfig.identity.didMethod = 'did:key';

    (identitySnapParams.snap as SnapMock).rpcMocks.snap_dialog.mockReturnValue(
      true,
    );

    const switchMethodResult = await switchMethod(
      identitySnapParams,
      'did:pkh',
    );
    expect(switchMethodResult).toBeTruthy();
    expect(
      snapState.accountState[snapState.currentAccount].accountConfig.identity
        .didMethod,
    ).toBe('did:pkh');

    expect.assertions(2);
  });

  it('should throw error when switch to invalid method', async () => {
    // setup
    (identitySnapParams.snap as SnapMock).rpcMocks.snap_dialog.mockReturnValue(
      true,
    );

    await expect(
      switchMethod(identitySnapParams, 'did:inv'),
    ).rejects.toThrowError();

    expect.assertions(1);
  });

  it('should not switch method when user rejects', async () => {
    snapState.accountState[
      snapState.currentAccount
    ].accountConfig.identity.didMethod = 'did:key';

    // setup
    (identitySnapParams.snap as SnapMock).rpcMocks.snap_dialog.mockReturnValue(
      false,
    );

    const switchMethodPromise = switchMethod(identitySnapParams, 'did:pkh');

    await expect(switchMethodPromise).resolves.toBeFalsy();
    expect(
      snapState.accountState[snapState.currentAccount].accountConfig.identity
        .didMethod,
    ).toBe('did:key');

    expect.assertions(2);
  });
});
