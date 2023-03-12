import { ProofFormat } from '@veramo/core';
import { SaveOptions } from '../plugins/veramo/verfiable-creds-manager';

export type CreateVCRequestParams = {
  vcValue: object;
  vcKey?: string;
  credTypes?: string[];
  options?: SaveOptions;
  accessToken?: string;
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
