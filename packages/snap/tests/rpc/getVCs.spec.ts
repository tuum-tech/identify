import { SnapProvider } from '@metamask/snap-types';
import { IdentitySnapState } from 'src/interfaces';
import { connectHederaAccount } from '../../src/rpc/hedera/connectHederaAccount';
import { createVC } from '../../src/rpc/vc/createVC';
import { getVCs } from '../../src/rpc/vc/getVCs';
import { getDefaultSnapState } from '../testUtils/constants';
import { createMockWallet, WalletMock } from '../testUtils/wallet.mock';
jest.mock('uuid');

  describe.skip('getVCs', () => {
    let walletMock: SnapProvider & WalletMock;
    let snapState: IdentitySnapState; 


    beforeEach(async() => {
      snapState = getDefaultSnapState();
      walletMock = createMockWallet();
      walletMock.rpcMocks.eth_chainId.mockReturnValue('0x128');

      let privateKey = '2386d1d21644dc65d4e4b9e2242c5f155cab174916cbc46ad85622cdaeac835c';
      let connected = await connectHederaAccount(snapState, privateKey, '0.0.15215', walletMock);
    });

  

    it('should succeed returning VCS', async () => {

      let snapState = getDefaultSnapState();
      await createVC(walletMock, snapState, { vcValue: {'prop':10} });
      await createVC(walletMock, snapState, { vcValue: {'prop':20} });

      console.log("state: " + JSON.stringify(snapState));
      let vcsReturned  = await getVCs(walletMock, snapState, {});
      expect(vcsReturned.length).toEqual(2);

      expect.assertions(1);
    });
  

     it.skip('should return only LoginType VCs', async () => {

      let snapState = getDefaultSnapState();
      await createVC(walletMock, snapState, { vcValue: {'prop':10}, credTypes: ['Login'] });
      await createVC(walletMock, snapState, { vcValue: {'prop':20} });

      console.log("state: " + JSON.stringify(snapState));
      let vcsReturned  = await getVCs(walletMock, snapState, {options: {}, filter: {type: 'vcType', filter:'Login'}});
      expect(vcsReturned.length).toEqual(1);

      expect.assertions(1);


      expect.assertions(1);
    });
  

     it('should return empty if user rejects confirm', async () => {

     let snapState = getDefaultSnapState();
      await createVC(walletMock, snapState, { vcValue: {'prop':10} });
      await createVC(walletMock, snapState, { vcValue: {'prop':20} });

      walletMock.rpcMocks.snap_confirm.mockReturnValue(false);

      let vcsReturned  = await getVCs(walletMock, snapState, {});
      await expect(getVCs(walletMock, snapState, {})).rejects.toThrowError();

      expect.assertions(1);
    });
});