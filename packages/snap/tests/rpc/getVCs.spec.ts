import { MetaMaskInpageProvider } from '@metamask/providers';
import { SnapsGlobalObject } from '@metamask/snaps-types';
import { IdentitySnapParams, IdentitySnapState } from 'src/interfaces';
import { connectHederaAccount } from '../../src/rpc/hedera/connectHederaAccount';
import { createVC } from '../../src/rpc/vc/createVC';
import { getVCs } from '../../src/rpc/vc/getVCs';
import { getDefaultSnapState } from '../testUtils/constants';
import { createMockSnap, SnapMock } from '../testUtils/snap.mock';

  describe('getVCs', () => {
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

  

    it('should succeed returning VCS without filter', async () => {

      (identitySnapParams.snap as SnapMock).rpcMocks.snap_dialog.mockReturnValue(true);

      await createVC(identitySnapParams, { vcValue: {'prop':10} });

      let vcsReturned  = await getVCs(identitySnapParams, {});
      expect(vcsReturned.length).toEqual(1);

      expect.assertions(1);
    });
  

     it('should filter Login Type VCs', async () => {

      (identitySnapParams.snap as SnapMock).rpcMocks.snap_dialog.mockReturnValue(true);
      await createVC(identitySnapParams, { vcValue: {'prop':10}, credTypes: ['Login'] });
      await createVC(identitySnapParams, { vcValue: {'prop':20} });

      let vcsReturned  = await getVCs(identitySnapParams, {options: {}, filter: {type: 'vcType', filter:'Login'}});
      expect(vcsReturned.length).toEqual(1);

      expect.assertions(1);
    });


    it('should filter VCs by id', async () => {
      
      (identitySnapParams.snap as SnapMock).rpcMocks.snap_dialog.mockReturnValue(true);
      await createVC(identitySnapParams, { vcValue: {'prop':10} });
      let vcs = await getVCs(identitySnapParams, {});
      let vcId = vcs[0].metadata.id;

      let vcsReturned  = await getVCs(identitySnapParams, {filter: {type: 'id', filter:vcId}});
      expect(vcsReturned.length).toEqual(1);

      expect.assertions(1);
    });
  

     it('should return empty if user rejects confirm', async () => {

      (identitySnapParams.snap as SnapMock).rpcMocks.snap_dialog.mockReturnValue(true);
      await createVC(identitySnapParams, { vcValue: {'prop':10} });

      (identitySnapParams.snap as SnapMock).rpcMocks.snap_dialog.mockReturnValue(false);

      await expect(getVCs(identitySnapParams, {})).resolves.toStrictEqual([]);

      expect.assertions(1);
    });
});