import { SnapProvider } from '@metamask/snap-types';
import { IdentitySnapState } from 'src/interfaces';
import { connectHederaAccount } from '../../src/rpc/hedera/connectHederaAccount';
import { createVC } from '../../src/rpc/vc/createVC';
import { getVCs } from '../../src/rpc/vc/getVCs';
import { getDefaultSnapState } from '../testUtils/constants';
import { createMockWallet, WalletMock } from '../testUtils/wallet.mock';
jest.mock('uuid');

  describe('getVCs', () => {
    let walletMock: SnapProvider & WalletMock;
    let snapState: IdentitySnapState; 


    beforeEach(async() => {
      snapState = getDefaultSnapState();
      walletMock = createMockWallet();
      walletMock.rpcMocks.eth_chainId.mockReturnValue('0x128');
            
      // Setup snap confirm return
      walletMock.rpcMocks.snap_confirm.mockReturnValue(true);
      

      let privateKey = '2386d1d21644dc65d4e4b9e2242c5f155cab174916cbc46ad85622cdaeac835c';
      let connected = await connectHederaAccount(snapState, privateKey, '0.0.15215', walletMock);
    });

  

    it.skip('should succeed returning VCS', async () => {

      walletMock.rpcMocks.snap_confirm.mockReturnValue(true);

      await createVC(walletMock, snapState, { vcValue: {'prop':10} });

     // console.log("state: " + JSON.stringify(snapState));
      let vcsReturned  = await getVCs(walletMock, snapState, {});
      expect(vcsReturned.length).toEqual(1);

      expect.assertions(1);
    });
  

     it.skip('should filter Login Type VCs', async () => {

      await createVC(walletMock, snapState, { vcValue: {'prop':10}, credTypes: ['Login'] });
      await createVC(walletMock, snapState, { vcValue: {'prop':20} });

      let vcsReturned  = await getVCs(walletMock, snapState, {options: {}, filter: {type: 'vcType', filter:'Login'}});
      expect(vcsReturned.length).toEqual(1);

      expect.assertions(1);
    });


    it('should filter VCs by id', async () => {

      await createVC(walletMock, snapState, { vcValue: {'prop':10} });
      let vcs = await getVCs(walletMock, snapState, {});
      let vcId = vcs[0].metadata.id;

      let vcsReturned  = await getVCs(walletMock, snapState, {filter: {type: 'id', filter:vcId}});
      expect(vcsReturned.length).toEqual(1);

      expect.assertions(1);
    });
  

     it('should return empty if user rejects confirm', async () => {

      walletMock.rpcMocks.snap_confirm.mockReturnValue(true);

      await createVC(walletMock, snapState, { vcValue: {'prop':10} });

      walletMock.rpcMocks.snap_confirm.mockReturnValue(false);

      await expect(getVCs(walletMock, snapState, {})).resolves.toStrictEqual([]);

      expect.assertions(1);
    });
});