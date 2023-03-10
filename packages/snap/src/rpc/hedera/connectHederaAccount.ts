import { PrivateKey } from '@hashgraph/sdk';
import { heading, panel, text } from '@metamask/snaps-ui';
import { toHederaAccountInfo } from '../../hedera';
import { getHederaNetwork, validHederaChainID } from '../../hedera/config';
import { IdentitySnapState, SnapDialogParams } from '../../interfaces';
import { importIdentitySnapAccount } from '../../snap/account';
import { snapDialog } from '../../snap/dialog';
import { getCurrentNetwork } from '../../snap/network';

/**
 * Connect Hedera Account.
 *
 * @param state - Identity state.
 * @param accountId - Account id.
 */
export async function connectHederaAccount(
  state: IdentitySnapState,
  accountId: string,
): Promise<boolean> {
  const chainId = await getCurrentNetwork(ethereum);
  if (validHederaChainID(chainId)) {
    const dialogParamsForPrivateKey: SnapDialogParams = {
      type: 'Prompt',
      content: panel([
        heading('Connect to Hedera Account'),
        text('Enter your ECDSA private key for your Hedera Account'),
      ]),
      placeholder: '2386d1d21644dc65d...', // You can use '2386d1d21644dc65d4e4b9e2242c5f155cab174916cbc46ad85622cdaeac835c' and '0.0.15215' for testing purposes
    };
    const privateKey = PrivateKey.fromString(
      (await snapDialog(snap, dialogParamsForPrivateKey)) as string,
    ).toStringRaw();

    const hederaAccountInfo = await toHederaAccountInfo(
      privateKey,
      accountId,
      getHederaNetwork(chainId),
    );
    if (hederaAccountInfo !== null) {
      const evmAddress = hederaAccountInfo.contractAccountId.startsWith('0x')
        ? hederaAccountInfo.contractAccountId
        : `0x${hederaAccountInfo.contractAccountId}`;

      await importIdentitySnapAccount(state, evmAddress, privateKey);
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
