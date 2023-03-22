import { PublicKey } from '@hashgraph/sdk';
import { BigNumber } from 'bignumber.js';
import _ from 'lodash';
import { isValidHederaAccountInfo } from '../../hedera';
import { getHederaNetwork, validHederaChainID } from '../../hedera/config';
import { SimpleHederaClient } from '../../hedera/service';
import { IdentitySnapParams } from '../../interfaces';
import { getCurrentNetwork } from '../../snap/network';
import { CreateNewHederaAccountRequestParams } from '../../types/params';
import { getHederaAccountIfExists } from '../../utils/params';

/**
 * Function to create a new hedera account.
 *
 * @param identitySnapParams - Identity snap params.
 * @param newHederaAccountParams - Parameters for creating a new hedera account.
 * @param hederaAccountIdToFundFrom - Hedera account identifier.
 */
export async function createNewHederaAccount(
  identitySnapParams: IdentitySnapParams,
  newHederaAccountParams: CreateNewHederaAccountRequestParams,
  hederaAccountIdToFundFrom?: string,
): Promise<string> {
  const { state, account } = identitySnapParams;
  const {
    hbarAmountToSend,
    newAccountPublickey = '',
    newAccountEvmAddress = '',
  } = newHederaAccountParams;

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
  if (
    hederaAccountIdToFundFrom === null ||
    _.isEmpty(hederaAccountIdToFundFrom)
  ) {
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

  let result;
  if (newAccountPublickey) {
    result = await hederaClient.createAccountForPublicKey({
      publicKey: PublicKey.fromString(newAccountPublickey),
      initialBalance: BigNumber(hbarAmountToSend),
    });
  } else {
    result = await hederaClient.createAccountForEvmAddress({
      evmAddress: newAccountEvmAddress,
      initialBalance: BigNumber(hbarAmountToSend),
    });
  }

  if (result === null || _.isEmpty(result)) {
    console.error(
      'Could not create a new hedera account id for the given public key or evm address. Please try again',
    );
    throw new Error(
      'Could not create a new hedera account id for the given public key or evm address. Please try again',
    );
  }
  return result.toString();
}
