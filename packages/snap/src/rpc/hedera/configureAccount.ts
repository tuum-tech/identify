import { AccountId, PrivateKey } from '@hashgraph/sdk';
import { HederaServiceImpl } from '../../hedera';
import { WalletHedera } from '../../hedera/wallet/abstract';
import { PrivateKeySoftwareWallet } from '../../hedera/wallet/software-private-key';
import { IdentitySnapState } from '../../interfaces';
import { getHederaChainIDs } from '../../utils/config';
import { getCurrentNetwork } from '../../utils/snapUtils';
import { updateSnapState } from '../../utils/stateUtils';

/* eslint-disable */
export async function configureHederaAccount(
  state: IdentitySnapState,
  _privateKey: string,
  _accountId: string
): Promise<boolean> {
  const hederaChainIDs = getHederaChainIDs();
  const chain_id = await getCurrentNetwork(wallet);
  if (Array.from(hederaChainIDs.keys()).includes(chain_id)) {
    const accountId = AccountId.fromString(_accountId);
    const privateKey = PrivateKey.fromStringECDSA(_privateKey);
    const publicKey = privateKey.publicKey;
    const walletHedera: WalletHedera = new PrivateKeySoftwareWallet(privateKey);
    const hedera = new HederaServiceImpl();

    const client = await hedera.createClient({
      walletHedera,
      keyIndex: 0,
      accountId: accountId,
      network: hederaChainIDs.get(chain_id) as string,
    });
    if (client != null) {
      const info = await client.getAccountInfo(_accountId);
      state.hederaAccount.evmAddress = info.contractAccountId;
      if (state.hederaAccount.evmAddress !== state.currentAccount) {
        state.currentAccount = state.hederaAccount.evmAddress;
      }
      state.hederaAccount.privateKey = privateKey.toStringRaw();
      state.hederaAccount.publicKey = publicKey.toStringRaw();
      state.hederaAccount.accountId = accountId.toString();
      await updateSnapState(wallet, state);
      return true;
    } else {
      console.error('Invalid private key or account Id');
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
