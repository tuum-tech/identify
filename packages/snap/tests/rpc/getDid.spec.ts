import { SnapProvider } from '@metamask/snap-types';
<<<<<<< HEAD:packages/snap/tests/rpc/getDid.spec.ts
import { getDid } from '../../src/rpc/did/getDID';
=======
import { onRpcRequest } from '../../src';
>>>>>>> main:packages/snap/tests/rpc/onRpcRequest.spec.ts
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
<<<<<<< HEAD:packages/snap/tests/rpc/getDid.spec.ts
        getDid(walletMock, getDefaultSnapState())
=======
        onRpcRequest({
          origin: 'localhost',
          request: {
            id: 'test-id',
            jsonrpc: '2.0',
            method: 'getDID',
            params: {},
          },
        }),
>>>>>>> main:packages/snap/tests/rpc/onRpcRequest.spec.ts
      ).resolves.toEqual(exampleDIDPkh);

      expect.assertions(1);
    });
  
});