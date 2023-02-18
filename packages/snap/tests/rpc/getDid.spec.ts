import { SnapProvider } from '@metamask/snap-types';
import { getDid } from '../../src/rpc/did/getDID';
import { exampleDIDPkh, getDefaultSnapState } from '../testUtils/constants';
import { createMockWallet, WalletMock } from '../testUtils/wallet.mock';
jest.mock('uuid');

  describe('getDID', () => {
     let walletMock: SnapProvider & WalletMock;

    beforeEach(() => {
      walletMock = createMockWallet();
      walletMock.rpcMocks.snap_manageState('update', getDefaultSnapState());
      //walletMock.rpcMocks.snap_confirm()
      //global.wallet = walletMock;
    });

    it('should succeed returning current did (did:pkh)', async () => {
      await expect(
        getDid(walletMock, getDefaultSnapState())
      ).resolves.toEqual(exampleDIDPkh);

      expect.assertions(1);
    });
  
});