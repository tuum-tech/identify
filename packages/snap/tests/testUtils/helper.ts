import { VerifiableCredential } from 'did-jwt-vc';
import { VeramoAgent } from 'src/veramo/agent';

export const getDefaultCredential = async (
  agent: VeramoAgent,
  type = 'Default',
): Promise<VerifiableCredential> => {
  const createVcResult = await agent.createVC(
    'vcData',
    { name: 'Diego, the tester' },
    'snap',
    ['VerifiableCredential', type],
  );
  const getVcsResult = await agent.getVCs(
    { store: 'snap' },
    { type: 'id', filter: createVcResult[0].id },
  );
  return getVcsResult[0].data as VerifiableCredential;
};
