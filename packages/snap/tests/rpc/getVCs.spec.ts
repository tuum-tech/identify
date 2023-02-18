import { SnapProvider } from '@metamask/snap-types';
import { IIdentifier } from '@veramo/core';
import { IdentitySnapState } from 'src/interfaces';
import { getVCs } from '../../src/rpc/vc/getVCs';
import { getAgent } from '../../src/veramo/setup';
import { getDefaultSnapState } from '../testUtils/constants';
import { getDefaultCredential } from '../testUtils/helper';
import { createMockWallet, WalletMock } from '../testUtils/wallet.mock';
jest.mock('uuid');

  describe('getVCs', () => {
    let walletMock: SnapProvider & WalletMock;
    let identifier: IIdentifier;
    let agent: any;
    let snapState: IdentitySnapState; 

    beforeEach( async () => {
      walletMock = createMockWallet();
      snapState = getDefaultSnapState();
      walletMock.rpcMocks.snap_manageState('update', snapState);
      agent = await getAgent(walletMock, snapState);
      identifier = await agent.didManagerCreate({ kms: 'snap', provider: "did:pkh", options: { chainId: "1" } });
        snapState.accountState[snapState.currentAccount].identifiers[identifier.did] = identifier;

      //walletMock.rpcMocks.snap_confirm()
      //global.wallet = walletMock;
    });

  

    it('should succeed returning VCS', async () => {

      let snapState = getDefaultSnapState();

      let identifier = await agent.didManagerCreate({ kms: 'snap', provider: "did:pkh", options: { chainId: "1" } });
        snapState.accountState[snapState.currentAccount].identifiers[identifier.did] = identifier;


      let credential = await getDefaultCredential(agent, identifier.did);


      snapState.accountState[snapState.currentAccount].vcs["vc1"] = credential;
            walletMock.rpcMocks.snap_confirm.mockReturnValue(true);

      console.log("state: " + JSON.stringify(snapState));
      let vcsReturned  = await getVCs(walletMock, snapState, {});
      expect(vcsReturned[0].data).toEqual(credential);



      expect.assertions(1);
    });
  

     it.skip('should return only LoginType VCs', async () => {

      let snapState = getDefaultSnapState();
      let agent = await getAgent(walletMock, snapState);

      let identifier = await agent.didManagerCreate({ kms: 'snap', provider: "did:pkh", options: { chainId: "1" } });
        snapState.accountState[snapState.currentAccount].identifiers[identifier.did] = identifier;


      let credential1 = await getDefaultCredential(agent, identifier.did);
      let credential2 = await getDefaultCredential(agent, identifier.did, 'Login');

      snapState.accountState[snapState.currentAccount].vcs["credential1"] = credential1;
      snapState.accountState[snapState.currentAccount].vcs["credential2"] = credential2;

      walletMock.rpcMocks.snap_confirm.mockReturnValue(true);

      let vcsReturned  = await getVCs(walletMock, snapState, {filter: {type: 'vcType', filter: 'Login'}});
      console.log("vcsReturned: " + JSON.stringify(vcsReturned));
      expect(vcsReturned[0].data).toEqual(credential2);



      expect.assertions(1);
    });
  

     it('should return empty if user rejects confirm', async () => {

      let snapState = getDefaultSnapState();
      let agent = await getAgent(walletMock, snapState);

      let identifier = await agent.didManagerCreate({ kms: 'snap', provider: "did:pkh", options: { chainId: "1" } });
        snapState.accountState[snapState.currentAccount].identifiers[identifier.did] = identifier;

      let credential1 = await getDefaultCredential(agent, identifier.did);

      snapState.accountState[snapState.currentAccount].vcs["credential1"] = credential1;

      walletMock.rpcMocks.snap_confirm.mockReturnValue(false);

      console.log("state: " + JSON.stringify(snapState));
      let vcsReturned  = await getVCs(walletMock, snapState, {});
      expect(vcsReturned.length).toEqual(0);



      expect.assertions(1);
    });
});