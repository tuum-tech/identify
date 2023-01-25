import { toHederaAccountInfo } from '../../hedera';
import { getHederaNetwork, validHederaChainID } from '../../hedera/config';
import { IdentitySnapState } from '../../interfaces';
import { getKeyPair } from '../../utils/hederaUtils';
import { getCurrentNetwork } from '../../utils/snapUtils';
import { initAccountState, updateSnapState } from '../../utils/stateUtils';
import { veramoImportMetaMaskAccount } from '../../utils/veramoUtils';

/* eslint-disable */
export async function connectHederaAccount(
  state: IdentitySnapState,
  _privateKey: string,
  _accountId: string
): Promise<boolean> {
  const chainId = await getCurrentNetwork(wallet);
  if (validHederaChainID(chainId)) {
    const hederaAccountInfo = await toHederaAccountInfo(
      _privateKey,
      _accountId,
      getHederaNetwork(chainId)
    );
    if (hederaAccountInfo !== null) {
      const evmAddress = hederaAccountInfo.contractAccountId.startsWith('0x')
        ? hederaAccountInfo.contractAccountId
        : '0x' + hederaAccountInfo.contractAccountId;

      state.currentAccount = evmAddress;
      if (!(evmAddress in state.accountState)) {
        await initAccountState(wallet, state, evmAddress);
      }
      state.accountState[state.currentAccount].hederaAccount.evmAddress =
        evmAddress;
      state.accountState[state.currentAccount].hederaAccount.accountId =
        _accountId;
      await updateSnapState(wallet, state);
      const keyPair = await getKeyPair(_privateKey);
      await veramoImportMetaMaskAccount(wallet, state, keyPair);
      return true;
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
