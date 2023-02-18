/* eslint-disable */

import { SnapProvider } from '@metamask/snap-types';
import { IdentitySnapState } from '../../src/interfaces';
import { saveVC } from '../../src/rpc/vc/saveVC';
import { SaveVCRequestParams } from '../../src/types/params';
import { getAgent } from '../../src/veramo/setup';
import { getDefaultSnapState } from '../testUtils/constants';
import { getDefaultCredential } from '../testUtils/helper';
import { createMockWallet, WalletMock } from '../testUtils/wallet.mock';
jest.mock('uuid');

  describe('saveVC', () => {
    
    
    beforeEach(() => {
      
    });

    it('should succeed saving passing VC', async () => {

    let walletMock: SnapProvider & WalletMock;
      walletMock = createMockWallet();
      walletMock.rpcMocks.snap_manageState('update', getDefaultSnapState());

      let snapState: IdentitySnapState = getDefaultSnapState();
      let agent = await getAgent(walletMock, snapState);
      
      walletMock.rpcMocks.snap_confirm.mockReturnValue(true);

 
      let identifier = await agent.didManagerCreate({ kms: 'snap', provider: "did:pkh", options: { chainId: "1" } });
      snapState.accountState[snapState.currentAccount].identifiers[identifier.did] = identifier;


      let credential = await getDefaultCredential(agent, identifier.did);
      let params: SaveVCRequestParams = {
        verifiableCredential: credential,
        
      };

      let result = await saveVC(walletMock, snapState, params)

      expect(result.length).toBe(1);

      expect.assertions(1);
    });
  
});