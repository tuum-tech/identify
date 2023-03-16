import { PublicKey } from '@hashgraph/sdk';
import { BigNumber } from 'bignumber.js';
import _ from 'lodash';
import { isValidHederaAccountInfo } from '../../hedera';
import { getHederaNetwork, validHederaChainID } from '../../hedera/config';
import { SimpleHederaClient } from '../../hedera/service';
import { IdentitySnapParams } from '../../interfaces';
import { getCurrentNetwork } from '../../snap/network';
import { getHederaAccountIfExists } from '../../utils/params';

/**
 * Function to create a new hedera account.
 *
 * @param identitySnapParams - Identity snap params.
 * @param newAccountPublickey - Public key of the account to send some HBAR to.
 * @param hbarAmountToSend - Amount of hbars to send to the new account.
 * @param hederaAccountId - Hedera account identifier.
 */
export async function createNewHederaAccount(
  identitySnapParams: IdentitySnapParams,
  newAccountPublickey: string,
  hbarAmountToSend: number,
  hederaAccountId?: string,
): Promise<string> {
  const { state, account } = identitySnapParams;

  const chainId = await getCurrentNetwork(ethereum);
  if (!validHederaChainID(chainId)) {
    console.error(
      'Invalid Chain ID. Valid chainIDs for Hedera: [0x127: mainnet, 0x128: testnet, 0x129: previewnet, 0x12a: localnet]',
    );
    throw new Error(
      'Non-Hedera network was selected on Metamask while trying to configure the Hedera network. Please switch the network to Hedera Network first',
    );
  }

  let _accountId = '';
  if (hederaAccountId === null || _.isEmpty(hederaAccountId)) {
    _accountId = await getHederaAccountIfExists(
      state,
      undefined,
      account.evmAddress,
    );
  }

  const hederaClient = (await isValidHederaAccountInfo(
    account.privateKey,
    _accountId,
    getHederaNetwork(chainId),
  )) as SimpleHederaClient;

  const options = {
    publicKey: PublicKey.fromString(newAccountPublickey),
    initialBalance: BigNumber(hbarAmountToSend),
  };
  const result = await hederaClient.createAccountForPublicKey(options);
  if (result === null || _.isEmpty(result)) {
    console.error(
      'Could not create a new account for the given public key. Please try again',
    );
    throw new Error(
      'Could not create a new account for the given public key. Please try again',
    );
  }
  return result.toString();
}
