import { SnapProvider } from '@metamask/snap-types';
import { onRpcRequest } from '../../src';
import { exampleDIDPkh, getDefaultSnapState } from '../testUtils/constants';
import { createMockWallet, WalletMock } from '../testUtils/wallet.mock';

jest.mock('uuid');

  describe.skip('getDID', () => {
     let walletMock: SnapProvider & WalletMock;

    beforeEach(() => {
      walletMock = createMockWallet();
      walletMock.rpcMocks.snap_manageState('update', getDefaultSnapState());
      //walletMock.rpcMocks.snap_confirm()
      //global.wallet = walletMock;
    });

    it('should succeed returning current did (did:pkh)', async () => {
      await expect(
        onRpcRequest({
          origin: 'localhost',
          request: {
            id: 'test-id',
            jsonrpc: '2.0',
            method: 'getDID',
            params: {},
          },
        }),
      ).resolves.toEqual(exampleDIDPkh);

      expect.assertions(1);
    });
  
});