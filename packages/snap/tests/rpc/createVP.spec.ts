/* eslint-disable */

import { SnapProvider } from '@metamask/snap-types';
import { IdentitySnapState } from '../../src/interfaces';
import { connectHederaAccount } from '../../src/rpc/hedera/connectHederaAccount';
import { createVC } from '../../src/rpc/vc/createVC';
import { createVP } from '../../src/rpc/vc/createVP';
import { SaveVCRequestParams } from '../../src/types/params';
import { getDefaultSnapState } from '../testUtils/constants';
import { createMockWallet, WalletMock } from '../testUtils/wallet.mock';
jest.mock('uuid');

  describe('createVP', () => {
    
     let walletMock: SnapProvider & WalletMock;
         let snapState: IdentitySnapState; 

    beforeEach(async() => {
      snapState = getDefaultSnapState();
      walletMock = createMockWallet();
      walletMock.rpcMocks.eth_chainId.mockReturnValue('0x128');

      let privateKey = '2386d1d21644dc65d4e4b9e2242c5f155cab174916cbc46ad85622cdaeac835c';
      let connected = await connectHederaAccount(snapState, privateKey, '0.0.15215', walletMock);
    });

    it('should succeed creating VP from 1 VC', async () => {

           
      // Setup snap confirm return
      walletMock.rpcMocks.snap_confirm.mockReturnValue(true);
      
      let createCredentialResult = await createVC(walletMock, snapState, { vcValue: {'name':'Diego'}, credTypes: ["Login"]});
      let params: SaveVCRequestParams = {
        verifiableCredential: createCredentialResult[0].id
      }


      // Act and assert
      await expect(createVP(walletMock, snapState, {vcs: [createCredentialResult[0].id as string]})).resolves.not.toBeUndefined();



      expect.assertions(1);
    });

      it('should throw error when user rejects confirm', async () => {

           
      // Setup snap confirm return
      walletMock.rpcMocks.snap_confirm.mockReturnValue(true);
      
      let createCredentialResult = await createVC(walletMock, snapState, { vcValue: {'name':'Diego'}, credTypes: ["Login"]});
      let params: SaveVCRequestParams = {
        verifiableCredential: createCredentialResult[0].id
      }

      walletMock.rpcMocks.snap_confirm.mockReturnValue(false);

      // Act and assert
      await expect(createVP(walletMock, snapState, {vcs: [createCredentialResult[0].id as string]})).rejects.toThrow();



      expect.assertions(1);
    });
  
});