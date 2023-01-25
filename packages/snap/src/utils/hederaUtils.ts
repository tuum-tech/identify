import { PrivateKey } from '@hashgraph/sdk';
import { KeyPair } from '../types/crypto';

/* eslint-disable */
export async function getKeyPair(privateKey: string): Promise<KeyPair> {
  return {
    privateKey,
    publicKey: PrivateKey.fromStringECDSA(privateKey).publicKey.toStringRaw(),
  } as KeyPair;
}
