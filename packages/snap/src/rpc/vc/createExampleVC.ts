import { SnapProvider } from '@metamask/snap-types';
import { ExampleVCValue, IdentitySnapState } from '../../interfaces';
import { snapConfirm } from '../../utils/snapUtils';
import { veramoCreateExampleVC } from '../../utils/veramoUtils';

/* eslint-disable */
export async function createExampleVC(
  wallet: SnapProvider,
  state: IdentitySnapState,
  exampleVCData: ExampleVCValue
) {
  const promptObj = {
    prompt: 'Create and Save Example VC',
    description: `Would you like to create and save the following VC in snap?`,
    textAreaContent: JSON.stringify(exampleVCData),
  };
  if (await snapConfirm(wallet, promptObj)) {
    return await veramoCreateExampleVC(
      wallet,
      state,
      exampleVCData
    );
  }
  return false;
}
