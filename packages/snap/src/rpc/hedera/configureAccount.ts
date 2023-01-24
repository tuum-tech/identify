import { IdentitySnapState } from '../../interfaces';
import { getHederaChainIDs } from '../../utils/config';
import { getKeyPair } from '../../utils/hederaUtils';
import { getCurrentNetwork } from '../../utils/snapUtils';
import { initAccountState, updateSnapState } from '../../utils/stateUtils';
import { veramoImportMetaMaskAccount } from '../../utils/veramoUtils';
import { toHederaAccountInfo } from '../../veramo/plugins/did-provider-pkh/src/pkh-did-provider';

/* eslint-disable */
export async function configureHederaAccount(
  state: IdentitySnapState,
  _privateKey: string,
  _accountId: string
): Promise<boolean> {
  const hederaChainIDs = getHederaChainIDs();
  const chain_id = await getCurrentNetwork(wallet);
  if (Array.from(hederaChainIDs.keys()).includes(chain_id)) {
    const hederaAccountInfo = await toHederaAccountInfo(
      _privateKey,
      _accountId,
      hederaChainIDs.get(chain_id) as string
    );
    if (hederaAccountInfo !== null) {
      state.currentAccount = _accountId;
      if (!(_accountId in state.accountState)) {
        await initAccountState(wallet, state, _accountId);
      }
      state.accountState[state.currentAccount].hederaAccount.evmAddress =
        hederaAccountInfo.contractAccountId;
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
