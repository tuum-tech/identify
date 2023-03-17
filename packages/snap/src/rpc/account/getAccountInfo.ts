import { validHederaChainID } from '../../hedera/config';
import { IdentitySnapParams, PublicAccountInfo } from '../../interfaces';
import { getCurrentNetwork } from '../../snap/network';
import { getHederaAccountIfExists } from '../../utils/params';

/**
 * Get did.
 *
 * @param identitySnapParams - Identity snap params.
 * @param hederaAccountId - Hedera Identifier.
 */
export async function getAccountInfo(
  identitySnapParams: IdentitySnapParams,
  hederaAccountId?: string,
): Promise<PublicAccountInfo> {
  let accountId = hederaAccountId;
  const { state, account } = identitySnapParams;
  const publicAccountInfo: PublicAccountInfo = {
    evmAddress: account.evmAddress,
    did: account.identifier.did,
    publicKey: account.publicKey,
    method: account.method,
  };
  const chainId = await getCurrentNetwork(ethereum);
  if (validHederaChainID(chainId) && !hederaAccountId) {
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
  console.log(JSON.stringify(publicAccountInfo, null, 4));
  return publicAccountInfo;
}
