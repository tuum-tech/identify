import { MetaMaskInpageProvider } from '@metamask/providers';
import { SnapsGlobalObject } from '@metamask/snaps-types';
import { W3CVerifiableCredential } from '@veramo/core';
import { IdentitySnapParams, IdentitySnapState } from '../../src/interfaces';
import { connectHederaAccount } from '../../src/rpc/hedera/connectHederaAccount';
import { createVC } from '../../src/rpc/vc/createVC';
import { getVCs } from '../../src/rpc/vc/getVCs';
import { verifyVC } from '../../src/rpc/vc/verifyVC';
import { getDefaultSnapState } from '../testUtils/constants';
import { createMockSnap, SnapMock } from '../testUtils/snap.mock';


  describe('VerifyVC', () => {
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
    it('should verify VC', async () => {

      // Setup
      (identitySnapParams.snap as SnapMock).rpcMocks.snap_dialog.mockReturnValue(true);


      // create VC to verify
      let vcCreatedResult = await createVC(identitySnapParams, { vcValue: {'prop':10} });
      console.log("vcRes" + JSON.stringify(vcCreatedResult));
      let vc = await getVCs(identitySnapParams, {filter: {type: 'id', filter: vcCreatedResult[0].id}})


      await expect(verifyVC(identitySnapParams, vc[0].data as W3CVerifiableCredential)).resolves.toBe(true); 
      expect.assertions(1);
    });

     it('should reject if VC is tampered', async () => {

      // Setup
      (identitySnapParams.snap as SnapMock).rpcMocks.snap_dialog.mockReturnValue(true);

      // create VC to verify
      let vcCreatedResult = await createVC(identitySnapParams, { vcValue: {'prop':10} });
      let vc = await getVCs(identitySnapParams, {filter: {type: 'id', filter: vcCreatedResult[0].id}})

      let tamperedVc = JSON.parse(JSON.stringify(vc[0].data));
      
      tamperedVc["issuer"]["id"] = "did:pkh:eip155:296:0x7d871f006d97498ea338268a956af94ab2e65cde";
      console.log("tamp VC "+ JSON.stringify(tamperedVc));

      await expect(verifyVC(identitySnapParams, tamperedVc as W3CVerifiableCredential)).resolves.toBe(false); 
      expect.assertions(1);
    });

    // it.skip('should throw exception if user refused confirmation', async () => {

    //     // Setup
    //   walletMock.rpcMocks.snap_confirm.mockReturnValue(true);

    //   // create VC to verify
    //   let vcCreatedResult = await createVC(walletMock, snapState, { vcValue: {'prop':12} });
    //   let vc = await getVCs(walletMock, snapState, {filter: {type: 'id', filter: vcCreatedResult[0].id}})

    //   walletMock.rpcMocks.snap_confirm.mockReturnValue(false);
    //   await expect(verifyVC(walletMock, snapState, vc[0].data as W3CVerifiableCredential)).rejects.toThrowError(); 
    //   expect.assertions(1);
    // });
  
});