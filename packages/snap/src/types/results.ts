import { W3CVerifiableCredential } from '@veramo/core';

export interface GetVCsRequestResult {
  data: W3CVerifiableCredential;
  metadata: {
    id: string;
    store?: string;
  };
}

export interface SaveVCRequestResult {
  id: string;
  store?: string;
}
