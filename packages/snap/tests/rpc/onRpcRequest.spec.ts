import { SnapProvider } from '@metamask/snap-types';
import { onRpcRequest } from '../../src/index';
import { getDid } from '../../src/rpc/did/getDID';
import { exampleDIDPkh, getDefaultSnapState } from '../testUtils/constants';
import { createMockWallet, WalletMock } from '../testUtils/wallet.mock';
jest.mock('uuid');

describe('onRpcRequest', () => {
  let walletMock: SnapProvider & WalletMock;

  beforeEach(() => {
    walletMock = createMockWallet();
    walletMock.rpcMocks.snap_manageState('update', getDefaultSnapState());
    //global.wallet = walletMock;
  });

  describe.skip('getDID', () => {
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
        })
      ).resolves.toEqual(exampleDIDPkh);

      expect.assertions(1);
    });
  });


  describe('getDID', () => {
    it('should succeed returning current did (did:pkh)', async () => {
      await expect(
        getDid(walletMock, getDefaultSnapState())
      ).resolves.toEqual(exampleDIDPkh);

      expect.assertions(1);
    });
  });

});