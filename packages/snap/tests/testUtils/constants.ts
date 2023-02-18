import cloneDeep from 'lodash.clonedeep';
import { IdentitySnapState, SnapConfirmParams } from '../../src/interfaces';
import { getEmptyAccountState } from '../../src/utils/config';

export const privateKey =
  '0x63ce0077f0d617dbf54d5f335de2983313c6356f25b45e0f68f85bee1490a6ae';



export const hedera_privateKey = '2386d1d21644dc65d4e4b9e2242c5f155cab174916cbc46ad85622cdaeac835c';
export const hedera_accountId = '0.0.15215';

export const address = '0xb6665128eE91D84590f70c3268765384A9CAfBCd';
export const publicKey =
  '0x0480a9cd48fd436f8c1f81b156eb615618cd573c3eb1e6d937a17b8222027cae850a9f561d414001a8bdefdb713c619d2caf08a0c9655b0cf42de065bc51e0169a';
export const signedMsg =
  '0x30eb4dbf93e7bfdb109ed03f7803f2378fa27d18ddc233cb3d121b5ba13253fe2515076d1ba66f3dc282c182479b843c925c62eb1f5a0676bcaf995e8e7552941c';

export const exampleDIDPkh = `did:pkh:eip155:4:${address}`;

export const exampleDIDResolved = `{'didDocument': {'@context': ['https://www.w3.org/ns/did/v1', {'EcdsaSecp256k1RecoveryMethod2020': 'https://identity.foundation/EcdsaSecp256k1RecoverySignature2020#EcdsaSecp256k1RecoveryMethod2020', 'Ed25519VerificationKey2018': 'https://w3id.org/security#Ed25519VerificationKey2018', 'blockchainAccountId': 'https://w3id.org/security#blockchainAccountId'}], 'assertionMethod': ['did:pkh:eip155:4:0xb6665128eE91D84590f70c3268765384A9CAfBCd#blockchainAccountId'], 'authentication': ['did:pkh:eip155:4:0xb6665128eE91D84590f70c3268765384A9CAfBCd#blockchainAccountId'], 'id': 'did:pkh:eip155:4:0xb6665128eE91D84590f70c3268765384A9CAfBCd', 'verificationMethod': [{'blockchainAccountId': 'eip155:4:0xb6665128eE91D84590f70c3268765384A9CAfBCd', 'controller': 'did:pkh:eip155:4:0xb6665128eE91D84590f70c3268765384A9CAfBCd', 'id': 'did:pkh:eip155:4:0xb6665128eE91D84590f70c3268765384A9CAfBCd#blockchainAccountId', 'type': 'EcdsaSecp256k1RecoveryMethod2020'}]}, 'didDocumentMetadata': {}, 'didResolutionMetadata': {'contentType': 'application/did+ld+json'}}`;

const defaultSnapState: IdentitySnapState = {
  currentAccount: address, 
  accountState: {
    '0xb6665128eE91D84590f70c3268765384A9CAfBCd': getEmptyAccountState(),
  },
  snapConfig: {
    dApp: {
      disablePopups: false,
      friendlyDapps: [],
    },
    snap: {
      acceptedTerms: true,
    },
  },
};

export const getDefaultSnapState = (): IdentitySnapState => {
  //defaultSnapState.accountState[address].publicKey = publicKey;
  return cloneDeep(defaultSnapState);
};

export const getSnapStateWithIdentifiers = (): IdentitySnapState => {
  let snapStateWithIdentifiers = getDefaultSnapState();
  return snapStateWithIdentifiers;
  //snapStateWithIdentifiers.accountState[snapStateWithIdentifiers.currentAccount].identifiers[]
};

export const snapConfirmParams: SnapConfirmParams = {
  prompt: 'Test prompt',
  description: 'Test description',
  textAreaContent: 'Test text area content',
};
