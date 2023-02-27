import { SnapProvider } from '@metamask/snap-types';
import { IdentitySnapState } from 'src/interfaces';
import { switchMethod } from '../../src/rpc/did/switchMethods';
import { connectHederaAccount } from '../../src/rpc/hedera/connectHederaAccount';
import { getDefaultSnapState } from '../testUtils/constants';
import { createMockWallet, WalletMock } from '../testUtils/wallet.mock';


jest.mock('uuid');

  describe.skip('SwitchMethod', () => {
    

    let walletMock: SnapProvider & WalletMock;
    let snapState: IdentitySnapState; 

    beforeEach(async() => {
      snapState = getDefaultSnapState();
      walletMock = createMockWallet();
      walletMock.rpcMocks.eth_chainId.mockReturnValue('0x128');

      let privateKey = '2386d1d21644dc65d4e4b9e2242c5f155cab174916cbc46ad85622cdaeac835c';
      let connected = await connectHederaAccount(snapState, privateKey, '0.0.15215', walletMock);
    });
    


    it('should change snap state when switch to did:pkh methods', async () => {

      // setup
      snapState.accountState[snapState.currentAccount].accountConfig.identity.didMethod = "did:key";
      walletMock.rpcMocks.snap_confirm.mockReturnValue(true);

      let switchMethodResult = await switchMethod(walletMock, snapState, "did:pkh");
      expect(switchMethodResult).toBeTruthy();
      expect(snapState.accountState[snapState.currentAccount].accountConfig.identity.didMethod).toBe("did:pkh");

      expect.assertions(2);
    });

    it('should throw error when switch to invalid method', async () => {

      // setup
      walletMock.rpcMocks.snap_confirm.mockReturnValue(true);

      await expect(switchMethod(walletMock, snapState, "did:inv")).rejects.toThrowError();

      expect.assertions(1);
    });

      it('should not switch method when user rejects', async () => {

      snapState.accountState[snapState.currentAccount].accountConfig.identity.didMethod = "did:key";

      // setup
      walletMock.rpcMocks.snap_confirm.mockReturnValue(false);

      let switchMethodPromise = switchMethod(walletMock, snapState, "did:pkh");

      await expect(switchMethodPromise).resolves.toBeFalsy();
      expect(snapState.accountState[snapState.currentAccount].accountConfig.identity.didMethod).toBe("did:key");

      expect.assertions(2);
    });




});