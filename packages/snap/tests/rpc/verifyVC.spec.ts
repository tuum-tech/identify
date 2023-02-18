import { SnapProvider } from '@metamask/snap-types';
import { W3CVerifiableCredential } from '@veramo/core';
import { IdentitySnapState } from '../../src/interfaces';
import { connectHederaAccount } from '../../src/rpc/hedera/connectHederaAccount';
import { createVC } from '../../src/rpc/vc/createVC';
import { getVCs } from '../../src/rpc/vc/getVCs';
import { verifyVC } from '../../src/rpc/vc/verifyVC';
import { getDefaultSnapState } from '../testUtils/constants';
import { createMockWallet, WalletMock } from '../testUtils/wallet.mock';

jest.mock('uuid');

  describe('VerifyVC', () => {
    let walletMock: SnapProvider & WalletMock;
    let snapState: IdentitySnapState;
    
    beforeEach( async() => {
      snapState = getDefaultSnapState();
      walletMock = createMockWallet();
      walletMock.rpcMocks.eth_chainId.mockReturnValue('0x128');

      let privateKey = '2386d1d21644dc65d4e4b9e2242c5f155cab174916cbc46ad85622cdaeac835c';
      let connected = await connectHederaAccount(snapState, privateKey, '0.0.15215', walletMock);
    });

    it('should verify VC', async () => {

      // Setup
      walletMock.rpcMocks.snap_confirm.mockReturnValue(true);
      let vcCreatedResult = await createVC(walletMock, snapState, { vcValue: {'prop':10} });
   
      let vc = await getVCs(walletMock, snapState, {filter: {type: 'id', filter: vcCreatedResult[0].id}})


      console.log('-------VC ' + JSON.stringify(vc));
      await expect(verifyVC(walletMock, snapState, vc[0].data as W3CVerifiableCredential)).toBe(true); 
      

      expect.assertions(1);
    });

    it('should throw exception if user refused confirmation', async () => {

      let snapState: IdentitySnapState = getDefaultSnapState();
    
      walletMock.rpcMocks.snap_confirm.mockReturnValue(false);
      
      await expect(createVC(walletMock, getDefaultSnapState(), { vcValue: {'prop':10} })).rejects.toThrowError();
    });
  
});