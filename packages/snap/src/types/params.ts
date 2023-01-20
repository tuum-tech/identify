import { ProofFormat, W3CVerifiableCredential } from '@veramo/core';
import { Filter } from '../veramo/plugins/verfiable-creds-manager';

export type GetVCsOptions = {
  store?: string | string[];
  returnStore?: boolean;
};

export type GetVCsRequestParams = {
  filter?: Filter;
  options?: GetVCsOptions;
};

export type SaveVCOptions = {
  store?: string | string[];
};

export type SaveVCRequestParams = {
  verifiableCredential: W3CVerifiableCredential;
  options?: SaveVCOptions;
};

export type CreateVCRequestParams = {
  vcValue: object;
  vcKey?: string;
  credTypes?: string[];
  options?: SaveVCOptions;
};

export type RemoveVCOptions = {
  store?: string | string[];
};

export type RemoveVCsRequestParams = {
  id?: string | string[];
  options?: RemoveVCOptions;
};

export type ProofInfo = {
  proofFormat?: ProofFormat;
  type?: string;
  domain?: string;
  challenge?: string;
};

export type CreateVPRequestParams = {
  vcs: string[];
  proofInfo?: ProofInfo;
};
