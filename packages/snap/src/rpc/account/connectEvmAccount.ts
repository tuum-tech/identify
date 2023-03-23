import { heading, panel, text } from '@metamask/snaps-ui';
import { getCurrentNetwork } from '../../snap/network';
import {
  Account,
  AccountViaPrivateKey,
  EvmAccountParams,
  IdentitySnapState,
  SnapDialogParams,
} from '../../interfaces';
import { importIdentitySnapAccount } from '../../snap/account';
import { snapDialog } from '../../snap/dialog';
import { validEVMChainID } from '../../utils/config';

/**
 * Connect EVM Account.
 *
 * @param state - Identity state.
 * @param evmAccount - EVM Account Params.
 * @param getCompleteInfo - Whether to get the full account info or not.
 */
export async function connectEVMAccount(
  state: IdentitySnapState,
  evmAccount: EvmAccountParams,
  getCompleteInfo?: boolean,
): Promise<Account> {
  const chainId = await getCurrentNetwork(ethereum);

  if (validEVMChainID(chainId)) {
    const dialogParamsForPrivateKey: SnapDialogParams = {
      type: 'Prompt',
      content: panel([
        heading('Connect to EVM Account'),
        text('Enter your ECDSA private key for your EVM Account'),
      ]),
      placeholder: '787278d71bc9b50e8147...', // You can use 'd787278d71bc9b50e814705ca48fcf652e08fb5eb73773e98146c48846bde456'
    };
    const privateKey: string = (await snapDialog(
      snap,
      dialogParamsForPrivateKey,
    )) as string;

    // const wallet: Wallet = new ethers.Wallet(privateKey);
    const accountViaPrivateKey: AccountViaPrivateKey = {
      privateKey,
      publicKey: '',
      address: evmAccount.address,
    };

    const account = await importIdentitySnapAccount(
      state,
      '',
      accountViaPrivateKey,
    );
    if (getCompleteInfo) {
      return account;
    }
    return {
      evmAddress: account.evmAddress,
      method: account.method,
      publicKey: account.publicKey,
    } as Account;
  }

  console.error(
    'Invalid Chain ID. Valid chainIDs for EVM account: [137: polygon]',
  );
  throw new Error(
    'Invalid Chain ID. Valid chainIDs for EVM account: [137: polygon]',
  );
}
