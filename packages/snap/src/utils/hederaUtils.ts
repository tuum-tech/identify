/* import { AccountId, Client, PrivateKey } from '@hashgraph/sdk';
import { SnapProvider } from '@metamask/snap-types';
import { IdentitySnapState } from '../interfaces';
import { getCurrentNetwork } from './snapUtils'; */

/* eslint-disable */
/* export async function getCurrentDid(
  wallet: SnapProvider,
  state: IdentitySnapState,
  account: string
): Promise<string> {
  // Operator account ID and private key from string value
  const OPERATOR_ID = AccountId.fromString('0.0.48865029');
  const OPERATOR_KEY = PrivateKey.fromString(
    '2386d1d21644dc65d4e4b9e2242c5f155cab174916cbc46ad85622cdaeac835c'
  );

  // Pre-configured client for test network (testnet)
  // TODO: Configure client based on whether it's a testnet, previewnet or mainnet
  const client = Client.forTestnet();

  //Set the operator with the operator ID and operator key
  client.setOperator(OPERATOR_ID, OPERATOR_KEY);

  const method = state.accountState[account].accountConfig.identity.didMethod;
  const chain_id = await getCurrentNetwork(wallet);
  const result = `${method}:eip155:${chain_id}:${account}`;
  return result;
} */
