import { PrivateKey } from '@hashgraph/sdk';
import { KeyPair } from '../types/crypto';

/**
 * Function to get key pair.
 *
 * @param privateKey - Private key.
 */
export async function getKeyPair(privateKey: string): Promise<KeyPair> {
  return {
    privateKey,
    publicKey: PrivateKey.fromStringECDSA(privateKey).publicKey.toStringRaw(),
  } as KeyPair;
}
