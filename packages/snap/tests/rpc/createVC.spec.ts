import { SnapProvider } from '@metamask/snap-types';
import { IdentitySnapState } from '../../src/interfaces';
import { connectHederaAccount } from '../../src/rpc/hedera/connectHederaAccount';
import { createVC } from '../../src/rpc/vc/createVC';
import { getDefaultSnapState } from '../testUtils/constants';
import { createMockWallet, WalletMock } from '../testUtils/wallet.mock';

jest.mock('uuid');

  describe('createVC', () => {
     let walletMock: SnapProvider & WalletMock;

    beforeEach(() => {
      walletMock = createMockWallet();
      walletMock.rpcMocks.snap_manageState('update', getDefaultSnapState());
     
      //global.wallet = walletMock;
    });

    it('should create VC', async () => {

      let snapState: IdentitySnapState = getDefaultSnapState();

      walletMock.rpcMocks.eth_chainId.mockReturnValue('0x128');

      let privateKey = '2386d1d21644dc65d4e4b9e2242c5f155cab174916cbc46ad85622cdaeac835c';
      let connected = await connectHederaAccount(snapState, privateKey, '0.0.15215', walletMock);
  
      walletMock.rpcMocks.snap_confirm.mockReturnValue(true);
      let vcCreatedResult = await createVC(walletMock, snapState, { vcValue: {'prop':10} });
      console.log(JSON.stringify(vcCreatedResult));
      expect(vcCreatedResult.length).toBe(1); 
      

      expect.assertions(1);
    });

    it('should throw exception if user refused confirmation', async () => {

      let snapState: IdentitySnapState = getDefaultSnapState();
    
      walletMock.rpcMocks.snap_confirm.mockReturnValue(false);
      
      await expect(createVC(walletMock, getDefaultSnapState(), { vcValue: {'prop':10} })).rejects.toThrowError();
    });
  
});