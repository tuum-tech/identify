import { AccountId, ChainIdParams } from 'caip';
import type {
  DIDResolutionOptions,
  DIDResolutionResult,
  ParsedDID,
  Resolvable,
  ResolverRegistry,
} from 'did-resolver';
import { isValidNamespace, SECPK1_NAMESPACES } from './pkh-did-provider';

const DID_LD_JSON = 'application/did+ld+json';
const DID_JSON = 'application/did+json';

/**
 * Function to get DID document.
 *
 * @param did - DID.
 * @param blockchainAccountId - Blockchain Account id.
 * @returns DID document.
 */
function toDidDoc(did: string, blockchainAccountId: string): any {
  const { namespace } = AccountId.parse(blockchainAccountId)
    .chainId as ChainIdParams;
  const vmId = `${did}#blockchainAccountId`;
  const doc = {
    '@context': [
      'https://www.w3.org/ns/did/v1',
      {
        blockchainAccountId: 'https://w3id.org/security#blockchainAccountId',
        EcdsaSecp256k1RecoveryMethod2020:
          'https://identity.foundation/EcdsaSecp256k1RecoverySignature2020#EcdsaSecp256k1RecoveryMethod2020',
        Ed25519VerificationKey2018:
          'https://w3id.org/security#Ed25519VerificationKey2018',
      },
    ],
    id: did,
    verificationMethod: [
      {
        id: vmId,
        type: 'EcdsaSecp256k1RecoveryMethod2020',
        controller: did,
        blockchainAccountId,
      },
    ],
    authentication: [vmId],
    assertionMethod: [vmId],
  };
  if (!isValidNamespace(namespace)) {
    console.error(
      `Invalid namespace '${namespace}'. Valid namespaces are: ${SECPK1_NAMESPACES}`,
    );
    throw new Error(
      `Invalid namespace '${namespace}'. Valid namespaces are: ${SECPK1_NAMESPACES}`,
    );
  }
  return doc;
}

/**
 * Function to get resolver.
 *
 * @returns Resolver.
 */
export function getResolver(): ResolverRegistry {
  return {
    pkh: async (
      did: string,
      parsed: ParsedDID,
      _r: Resolvable,
      options: DIDResolutionOptions,
    ): Promise<DIDResolutionResult> => {
      const contentType = options.accept || DID_JSON;
      const response: DIDResolutionResult = {
        didResolutionMetadata: { contentType },
        didDocument: null,
        didDocumentMetadata: {},
      };
      try {
        const doc = toDidDoc(did, parsed.id);
        if (contentType === DID_LD_JSON) {
          response.didDocument = doc;
        } else if (contentType === DID_JSON) {
          delete doc['@context'];
          response.didDocument = doc;
        } else {
          delete response.didResolutionMetadata.contentType;
          response.didResolutionMetadata.error = 'representationNotSupported';
        }
      } catch (e) {
        response.didResolutionMetadata.error = 'invalidDid';
        response.didResolutionMetadata.message = (e as Error).message;
      }
      return response;
    },
  };
}
