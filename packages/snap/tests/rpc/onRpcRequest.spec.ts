import { SnapProvider } from '@metamask/snap-types';
import { onRpcRequest } from '../../src/index';
import { getDid } from '../../src/rpc/did/getDID';
import { resolveDID } from '../../src/rpc/did/resolveDID';
import { exampleDIDPkh, exampleDIDResolved, getDefaultSnapState } from '../testUtils/constants';
import { createMockWallet, WalletMock } from '../testUtils/wallet.mock';
jest.mock('uuid');

describe('onRpcRequest', () => {
  let walletMock: SnapProvider & WalletMock;

  beforeEach(() => {
    walletMock = createMockWallet();
    walletMock.rpcMocks.snap_manageState('update', getDefaultSnapState());
    //walletMock.rpcMocks.snap_confirm()
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

  describe('resolveDID', () => {
    it('should succeed returning current did resolved', async () => {
      await expect(
        resolveDID(walletMock, getDefaultSnapState(), exampleDIDPkh)
      ).resolves.toEqual(exampleDIDResolved);

      expect.assertions(1);
    });

    it('should resolve current did when didUrl undefined', async () => {
      await expect(
        resolveDID(walletMock, getDefaultSnapState(), undefined)
      ).resolves.toEqual(exampleDIDResolved);

      expect.assertions(1);
    });
  });

});