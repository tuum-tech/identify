import { ethers } from 'ethers';
import { validEVMChainID, validHederaChainID } from '../../hedera/config';
import {
  ExternalAccount,
  HederaAccountParams,
  IdentitySnapParams,
  PublicAccountInfo,
} from '../../interfaces';
import { getCurrentNetwork } from '../../snap/network';
import { getHederaAccountIfExists } from '../../utils/params';

/**
 * Get did.
 *
 * @param identitySnapParams - Identity snap params.
 * @param externalAccount - External Account.
 * @returns Public Account Info.
 */
export async function getAccountInfo(
  identitySnapParams: IdentitySnapParams,
  externalAccount?: ExternalAccount,
): Promise<PublicAccountInfo> {
  const { state, account } = identitySnapParams;

  const publicKey = ethers.utils.computePublicKey(
    ethers.utils.arrayify(account.publicKey),
    true,
  );

  const publicAccountInfo: PublicAccountInfo = {
    evmAddress: account.evmAddress,
    did: account.identifier.did,
    publicKey,
    method: account.method,
    externalAccountInfo: externalAccount,
  };
  const chainId = await getCurrentNetwork(ethereum);

  if (validHederaChainID(chainId)) {
    let { accountId } = externalAccount?.externalAccount
      .data as HederaAccountParams;

    if (!accountId) {
      accountId = await getHederaAccountIfExists(
        state,
        undefined,
        account.evmAddress,
      );
    }

    if (accountId) {
      publicAccountInfo.externalAccountInfo = {
        accountId,
      };
    }
  } else if (validEVMChainID(chainId)) {
    publicAccountInfo.externalAccountInfo = externalAccount;
  }

  console.log(JSON.stringify(publicAccountInfo, null, 4));
  return publicAccountInfo;
}
