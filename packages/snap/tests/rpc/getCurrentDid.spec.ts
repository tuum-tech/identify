import { SnapProvider } from '@metamask/snap-types';
import { getCurrentDid } from '../../src/utils/didUtils';
import {
  address,
  exampleDIDPkh,
  getDefaultSnapState
} from '../testUtils/constants';
import { createMockWallet, WalletMock } from '../testUtils/wallet.mock';

describe('getCurrentDid', () => {
 
 
  let walletMock: SnapProvider & WalletMock;

  beforeEach(() => {
    walletMock = createMockWallet();
  });

    it('should return did:pkh', async () => {
      const initialState = getDefaultSnapState();

      await expect(
        getCurrentDid(walletMock, initialState)
      ).resolves.toBe(`did:pkh:eip155:4:${address}`);

      expect.assertions(1);
    });

    it('should return did:key', async () => {
      const initialState = getDefaultSnapState();
      initialState.accountState[address].accountConfig.identity.didMethod =
        'did:pkh';

      await expect(
        getCurrentDid(walletMock, initialState)
      ).resolves.toBe(exampleDIDPkh);

      expect.assertions(1);
    });
  });
