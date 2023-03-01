import { MetaMaskInpageProvider } from '@metamask/providers';
import { SnapsGlobalObject } from '@metamask/snaps-types';
import { heading, panel, text } from '@metamask/snaps-ui';
import { toHederaAccountInfo } from '../../hedera';
import { getHederaNetwork, validHederaChainID } from '../../hedera/config';
import { IdentitySnapState, SnapDialogParams } from '../../interfaces';
import { snapDialog } from '../../snap/dialog';
import { getCurrentNetwork } from '../../snap/network';
import { initAccountState, updateSnapState } from '../../snap/state';
import { veramoConnectHederaAccount } from '../../utils/veramoUtils';
import { getAgent } from '../../veramo/setup';

/**
 * Connect Hedera Account.
 *
 * @param snap - Snap.
 * @param state - IdentitySnapState.
 * @param metamask - Metamask provider.
 * @param _accountId - Account id.
 */
export async function connectHederaAccount(
  snap: SnapsGlobalObject,
  state: IdentitySnapState,
  metamask: MetaMaskInpageProvider,
  _accountId: string,
): Promise<boolean> {
  const chainId = await getCurrentNetwork(metamask);
  if (validHederaChainID(chainId)) {
    const dialogParamsForPrivateKey: SnapDialogParams = {
      type: 'Prompt',
      content: panel([
        heading('Connect to Hedera Account'),
        text('Enter your ECDSA private key for your Hedera Account'),
      ]),
      placeholder: '2386d1d21644dc65d...', // You can use '2386d1d21644dc65d4e4b9e2242c5f155cab174916cbc46ad85622cdaeac835c' and '0.0.15215' for testing purposes
    };
    const privateKey = (await snapDialog(
      snap,
      dialogParamsForPrivateKey,
    )) as string;

    const hederaAccountInfo = await toHederaAccountInfo(
      privateKey,
      _accountId,
      getHederaNetwork(chainId),
    );
    if (hederaAccountInfo !== null) {
      const evmAddress = hederaAccountInfo.contractAccountId.startsWith('0x')
        ? hederaAccountInfo.contractAccountId
        : `0x${hederaAccountInfo.contractAccountId}`;

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
        privateKey,
      );
    }
    console.error('Could not retrieve hedera account info');
    return false;
  }

  console.error(
    'Invalid Chain ID. Valid chainIDs for Hedera: [0x127: mainnet, 0x128: testnet, 0x129: previewnet, 0x12a: localnet]',
  );
  throw new Error(
    'Non-Hedera network was selected on Metamask while trying to configure the Hedera network. Please switch the network to Hedera Network first',
  );
}
