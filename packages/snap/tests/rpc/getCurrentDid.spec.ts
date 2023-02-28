import { MetaMaskInpageProvider } from '@metamask/providers';
import { SnapsGlobalObject } from '@metamask/snaps-types';
import { IdentitySnapParams, IdentitySnapState } from 'src/interfaces';
import { connectHederaAccount } from '../../src/rpc/hedera/connectHederaAccount';
import { getCurrentDid } from '../../src/utils/didUtils';
import { getDefaultSnapState, hedera_address } from '../testUtils/constants';
import { createMockSnap, SnapMock } from '../testUtils/snap.mock';

describe('getCurrentDid', () => {
 
 
   let identitySnapParams: IdentitySnapParams;
    let snapState: IdentitySnapState; 
    let snapMock: SnapsGlobalObject & SnapMock;
    let metamask: MetaMaskInpageProvider;
    
    beforeEach(async() => {
      snapState = getDefaultSnapState();
      snapMock = createMockSnap();
      metamask = snapMock as unknown as MetaMaskInpageProvider;
      identitySnapParams = {
        metamask: metamask,
        snap: snapMock,
        state: snapState
      };
     
      let privateKey = '2386d1d21644dc65d4e4b9e2242c5f155cab174916cbc46ad85622cdaeac835c';
      (identitySnapParams.snap as SnapMock).rpcMocks.snap_dialog.mockReturnValue(privateKey);
      (identitySnapParams.snap as SnapMock).rpcMocks.eth_chainId.mockReturnValue('0x128');

      let connected = await connectHederaAccount(snapMock, snapState, metamask, '0.0.15215');
    });

    it('should return did:pkh', async () => {
     
      await expect(
        getCurrentDid(snapState, metamask)
      ).resolves.toBe(`did:pkh:eip155:296:${hedera_address}`);

      expect.assertions(1);
    });

  
  });
