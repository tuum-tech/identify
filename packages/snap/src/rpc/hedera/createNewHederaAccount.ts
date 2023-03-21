import { PublicKey } from '@hashgraph/sdk';
import { BigNumber } from 'bignumber.js';
import _ from 'lodash';
import { HederaServiceImpl, isValidHederaAccountInfo } from '../../hedera';
import { getHederaNetwork, validHederaChainID } from '../../hedera/config';
import { HederaMirrorInfo, SimpleHederaClient } from '../../hedera/service';
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
): Promise<HederaMirrorInfo> {
  const { state, account } = identitySnapParams;
  const {
    hbarAmountToSend,
    newAccountPublickey = '',
    newAccountEvmAddress = '',
  } = newHederaAccountParams;

  const chainId = await getCurrentNetwork(ethereum);
  if (!validHederaChainID(chainId)) {
    console.error(
      'Invalid Chain ID. Valid chainIDs for Hedera: [0x127: mainnet, 0x128: testnet, 0x129: previewnet]',
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

  const network = getHederaNetwork(chainId);
  const hederaClient = (await isValidHederaAccountInfo(
    account.privateKey,
    _accountId,
    network,
  )) as SimpleHederaClient;

  const hederaService = new HederaServiceImpl(network);
  let newAccount = false;
  let result;
  if (newAccountPublickey) {
    const publicKey = PublicKey.fromString(newAccountPublickey).toStringRaw();
    try {
      result = (await hederaService.getAccountFromPublicKey(
        publicKey,
      )) as HederaMirrorInfo;

      if (result === null || _.isEmpty(result)) {
        newAccount = true;
      }
    } catch (error) {
      console.log(
        'Error while retrieving account info using public key from the mirror node so let us just try to fund this account. Error: ',
        error,
      );
      newAccount = true;
    }

    if (newAccount) {
      result = (await hederaClient.createAccountForPublicKey({
        publicKey: PublicKey.fromString(publicKey),
        initialBalance: BigNumber(hbarAmountToSend),
      })) as HederaMirrorInfo;
    }
  } else {
    try {
      result = (await hederaService.getAccountFromEvmAddres(
        newAccountEvmAddress,
      )) as HederaMirrorInfo;

      if (result === null || _.isEmpty(result)) {
        newAccount = true;
      }
    } catch (error) {
      console.log(
        'Error while retrieving account info using evm address from the mirror node so let us just try to fund this account. Error: ',
        error,
      );
      newAccount = true;
    }

    if (newAccount) {
      result = (await hederaClient.createAccountForEvmAddress({
        evmAddress: newAccountEvmAddress,
        initialBalance: BigNumber(hbarAmountToSend),
      })) as HederaMirrorInfo;
    }
  }

  console.log(
    'Newly created Hedera Account info: ',
    JSON.stringify(result, null, 4),
  );

  if (result === null || _.isEmpty(result)) {
    console.error(
      'Could not create a new hedera account id for the given public key or evm address. Please try again',
    );
    throw new Error(
      'Could not create a new hedera account id for the given public key or evm address. Please try again',
    );
  }
  result.newlyCreated = newAccount;

  return result;
}
