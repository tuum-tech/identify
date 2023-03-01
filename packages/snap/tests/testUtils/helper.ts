import { VerifiableCredential } from 'did-jwt-vc';

export const getDefaultCredential = async (
  agent: any,
  did: string,
  type: string = 'Default',
): Promise<VerifiableCredential> => {
  let vc = await agent.createVerifiableCredential({
    credential: {
      issuer: { id: did },
      '@context': [
        'https://www.w3.org/2018/credentials/v1',
        'https://veramo.io/contexts/profile/v1',
      ],
      type: ['VerifiableCredential', type],
      issuanceDate: new Date().toISOString(),
      credentialSubject: {
        name: 'Diego, the tester',
      },
    },
    save: false,
    proofFormat: 'jwt',
  });
  return vc;
};
