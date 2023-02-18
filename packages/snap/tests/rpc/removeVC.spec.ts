import { SnapProvider } from '@metamask/snap-types';
import { IdentitySnapState } from '../../src/interfaces';
import { connectHederaAccount } from '../../src/rpc/hedera/connectHederaAccount';
import { createVC } from '../../src/rpc/vc/createVC';
import { getVCs } from '../../src/rpc/vc/getVCs';
import { removeVC } from '../../src/rpc/vc/removeVC';

import { getDefaultSnapState } from '../testUtils/constants';
import { createMockWallet, WalletMock } from '../testUtils/wallet.mock';

jest.mock('uuid');

  describe('RemoveVC', () => {
    let walletMock: SnapProvider & WalletMock;
    let snapState: IdentitySnapState;
    
    beforeEach( async() => {
      snapState = getDefaultSnapState();
      walletMock = createMockWallet();
      walletMock.rpcMocks.eth_chainId.mockReturnValue('0x128');

      let privateKey = '2386d1d21644dc65d4e4b9e2242c5f155cab174916cbc46ad85622cdaeac835c';
      let connected = await connectHederaAccount(snapState, privateKey, '0.0.15215', walletMock);
    });

    it('should remove VC', async () => {

      // Setup
      walletMock.rpcMocks.snap_confirm.mockReturnValue(true);

      // create VC 
      await createVC(walletMock, snapState, { vcValue: {'prop':10} });
      let getVcsResult = await getVCs(walletMock, snapState, {});

      expect(getVcsResult.length).toBe(1);

      // Remove VC 
      let removeVCResult = await removeVC(walletMock, snapState, {id: getVcsResult[0].metadata.id, options: {}});
      expect(removeVCResult?.length).toBe(1);
      
      // redo request 
      getVcsResult = await getVCs(walletMock, snapState, {});
      expect(getVcsResult.length).toBe(0);

      expect.assertions(3);
    });




    it('should throw exception if user refused confirmation', async () => {

     // Setup
      walletMock.rpcMocks.snap_confirm.mockReturnValue(true);

      // create VC 
      await createVC(walletMock, snapState, { vcValue: {'prop':10} });
      let getVcsResult = await getVCs(walletMock, snapState, {});

      expect(getVcsResult.length).toBe(1);
      
      console.log("res: "+ JSON.stringify(getVcsResult));

      // remove VC 
      walletMock.rpcMocks.snap_confirm.mockReturnValue(false);

      await expect(removeVC(walletMock, snapState, {id: getVcsResult[0].metadata.id, options: {}})).rejects.toThrowError();
      
      expect.assertions(2);
    });


  
});