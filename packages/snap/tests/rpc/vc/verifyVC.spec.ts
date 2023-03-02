import { MetaMaskInpageProvider } from '@metamask/providers';
import { SnapsGlobalObject } from '@metamask/snaps-types';
import { W3CVerifiableCredential } from '@veramo/core';
import { IdentitySnapParams, IdentitySnapState } from '../../../src/interfaces';
import { connectHederaAccount } from '../../../src/rpc/hedera/connectHederaAccount';
import { createVC } from '../../../src/rpc/vc/createVC';
import { getVCs } from '../../../src/rpc/vc/getVCs';
import { verifyVC } from '../../../src/rpc/vc/verifyVC';
import {
  getDefaultSnapState,
  hederaPrivateKey,
} from '../../testUtils/constants';
import { createMockSnap, SnapMock } from '../../testUtils/snap.mock';

describe('VerifyVC', () => {
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

  it('should verify VC', async () => {
    // Setup
    (identitySnapParams.snap as SnapMock).rpcMocks.snap_dialog.mockReturnValue(
      true,
    );

    // create VC to verify
    const vcCreatedResult = await createVC(identitySnapParams, {
      vcValue: { prop: 10 },
    });
    console.log(`vcRes${JSON.stringify(vcCreatedResult)}`);
    const vc = await getVCs(identitySnapParams, {
      filter: { type: 'id', filter: vcCreatedResult[0].id },
    });

    await expect(
      verifyVC(identitySnapParams, vc[0].data as W3CVerifiableCredential),
    ).resolves.toBe(true);
    expect.assertions(1);
  });

  it('should reject if VC is tampered', async () => {
    // Setup
    (identitySnapParams.snap as SnapMock).rpcMocks.snap_dialog.mockReturnValue(
      true,
    );

    // create VC to verify
    const vcCreatedResult = await createVC(identitySnapParams, {
      vcValue: { prop: 10 },
    });
    const vc = await getVCs(identitySnapParams, {
      filter: { type: 'id', filter: vcCreatedResult[0].id },
    });

    const tamperedVc = JSON.parse(JSON.stringify(vc[0].data));

    tamperedVc.issuer.id =
      'did:pkh:eip155:296:0x7d871f006d97498ea338268a956af94ab2e65cde';
    console.log(`tamp VC ${JSON.stringify(tamperedVc)}`);

    await expect(
      verifyVC(identitySnapParams, tamperedVc as W3CVerifiableCredential),
    ).resolves.toBe(false);
    expect.assertions(1);
  });
});
