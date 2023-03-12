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
  const { state, account } = identitySnapParams;
  const publicAccountInfo: PublicAccountInfo = {
    evmAddress: account.evmAddress,
    did: account.identifier.did,
    publicKey: account.publicKey,
    method: account.method,
  };
  console.log('hederaAccountId: ', hederaAccountId);
  const chainId = await getCurrentNetwork(ethereum);
  if (validHederaChainID(chainId) && !hederaAccountId) {
    publicAccountInfo.hederaAccountId = await getHederaAccountIfExists(
      state,
      undefined,
      account.evmAddress,
    );
  }
  console.log(JSON.stringify(publicAccountInfo, null, 4));
  return publicAccountInfo;
}
