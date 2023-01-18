import { PrivateKey } from '@hashgraph/sdk';
import { IdentitySnapState } from '../../interfaces';
import { getHederaChainIDs } from '../../utils/config';
import { getCurrentNetwork } from '../../utils/snapUtils';
import { updateSnapState } from '../../utils/stateUtils';
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
      state.hederaAccount.evmAddress = hederaAccountInfo.contractAccountId;
      if (state.hederaAccount.evmAddress !== state.currentAccount) {
        state.currentAccount = state.hederaAccount.evmAddress;
      }
      state.hederaAccount.privateKey = _privateKey;
      state.hederaAccount.publicKey =
        PrivateKey.fromStringECDSA(_privateKey).publicKey.toStringRaw();
      state.hederaAccount.accountId = _accountId;
      await updateSnapState(wallet, state);
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
