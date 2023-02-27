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

  describe.skip('VerifyVC', () => {
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

      // create VC to verify
      let vcCreatedResult = await createVC(walletMock, snapState, { vcValue: {'prop':10} });
      let vc = await getVCs(walletMock, snapState, {filter: {type: 'id', filter: vcCreatedResult[0].id}})


      await expect(verifyVC(walletMock, snapState, vc[0].data as W3CVerifiableCredential)).resolves.toBe(true); 
      expect.assertions(1);
    });

     it('should reject VC is tampered', async () => {

      // Setup
      walletMock.rpcMocks.snap_confirm.mockReturnValue(true);

      // create VC to verify
      let vcCreatedResult = await createVC(walletMock, snapState, { vcValue: {'prop':10} });
      let vc = await getVCs(walletMock, snapState, {filter: {type: 'id', filter: vcCreatedResult[0].id}})

      let tamperedVc = JSON.parse(JSON.stringify(vc[0].data));
      
      tamperedVc["issuer"]["id"] = "did:pkh:eip155:296:0x7d871f006d97498ea338268a956af94ab2e65cde";
      console.log("tamp VC "+ JSON.stringify(tamperedVc));

      await expect(verifyVC(walletMock, snapState, tamperedVc as W3CVerifiableCredential)).resolves.toBe(false); 
      expect.assertions(1);
    });

    it.skip('should throw exception if user refused confirmation', async () => {

        // Setup
      walletMock.rpcMocks.snap_confirm.mockReturnValue(true);

      // create VC to verify
      let vcCreatedResult = await createVC(walletMock, snapState, { vcValue: {'prop':12} });
      let vc = await getVCs(walletMock, snapState, {filter: {type: 'id', filter: vcCreatedResult[0].id}})

      walletMock.rpcMocks.snap_confirm.mockReturnValue(false);
      await expect(verifyVC(walletMock, snapState, vc[0].data as W3CVerifiableCredential)).rejects.toThrowError(); 
      expect.assertions(1);
    });
  
});