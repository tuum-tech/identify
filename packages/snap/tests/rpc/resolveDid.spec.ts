import { SnapProvider } from '@metamask/snap-types';
import { IdentitySnapState } from 'src/interfaces';
import { resolveDID } from '../../src/rpc/did/resolveDID';
import { connectHederaAccount } from '../../src/rpc/hedera/connectHederaAccount';
import { exampleDIDPkh, getDefaultSnapState } from '../testUtils/constants';
import { createMockWallet, WalletMock } from '../testUtils/wallet.mock';
jest.mock('uuid');

 

  describe('resolveDID', () => {
    let walletMock: SnapProvider & WalletMock;
    let snapState: IdentitySnapState; 

    beforeEach(async() => {
      snapState = getDefaultSnapState();
      walletMock = createMockWallet();
      walletMock.rpcMocks.eth_chainId.mockReturnValue('0x128');

      let privateKey = '2386d1d21644dc65d4e4b9e2242c5f155cab174916cbc46ad85622cdaeac835c';
      let connected = await connectHederaAccount(snapState, privateKey, '0.0.15215', walletMock);
    });
    it('should succeed returning current did resolved', async () => {
     
      let resolvedDid = await resolveDID(walletMock, snapState, exampleDIDPkh);

      console.log("resolved did:" + JSON.stringify(resolvedDid));
      let id = resolvedDid?.didDocument!["id"];

      expect(id).toEqual(exampleDIDPkh); 

      expect.assertions(1);
    });

    it('should resolve current did when didUrl undefined', async () => {

      let resolvedDid = await resolveDID(walletMock, snapState, undefined);

      let id = resolvedDid?.didDocument!["id"];

      expect(id).toEqual(snapState.accountState['0x7d871f006d97498ea338268a956af94ab2e65cdd'].identifiers[id as string].did); 

      expect.assertions(1);
    });
  });