import { MetaMaskInpageProvider } from '@metamask/providers';
import { SnapsGlobalObject } from '@metamask/snaps-types';
import { toHederaAccountInfo } from '../../hedera';
import { getHederaNetwork, validHederaChainID } from '../../hedera/config';
import { IdentitySnapState } from '../../interfaces';
import { getCurrentNetwork } from '../../utils/snapUtils';
import { initAccountState, updateSnapState } from '../../utils/stateUtils';
import { veramoConnectHederaAccount } from '../../utils/veramoUtils';
import { getAgent } from '../../veramo/setup';

/* eslint-disable */
export async function connectHederaAccount(
  snap: SnapsGlobalObject,
  state: IdentitySnapState,
  metamask: MetaMaskInpageProvider,
  _privateKey: string,
  _accountId: string,
  _wallet?: SnapProvider
): Promise<boolean> {

  let walletToUse = _wallet === undefined ? wallet: _wallet; 


  const chainId = await getCurrentNetwork(walletToUse);


  if (validHederaChainID(chainId)) {
    console.log("------------------1" + chainId);
    const hederaAccountInfo = await toHederaAccountInfo(
      _privateKey,
      _accountId,
      getHederaNetwork(chainId)
    );
        console.log("------------------2");

    if (hederaAccountInfo !== null) {
      const evmAddress = hederaAccountInfo.contractAccountId.startsWith('0x')
        ? hederaAccountInfo.contractAccountId
        : '0x' + hederaAccountInfo.contractAccountId;

      state.currentAccount = evmAddress;
      if (!(state.currentAccount in state.accountState)) {
        await initAccountState(snap, state, state.currentAccount);
      }
      state.accountState[state.currentAccount].hederaAccount.evmAddress =
        evmAddress;
      state.accountState[state.currentAccount].hederaAccount.accountId =
        _accountId;
      await updateSnapState(snap, state);
      const agent = await getAgent(snap);
      return await veramoConnectHederaAccount(
        agent,
        state.currentAccount,
        _privateKey
      );
    } else {
      console.error('Could not retrieve hedera account info');
      return false;
    }
  } else {
    console.error(
      'Invalid Chain ID. Valid chainIDs for Hedera: [0x127: mainnet, 0x128: testnet, 0x129: previewnet, 0x12a: localnet]'
    );
    throw new Error(
      'Non-Hedera network was selected on Metamask while trying to configure the Hedera network. Please switch the network to Hedera Network first'
    );
  }
}
