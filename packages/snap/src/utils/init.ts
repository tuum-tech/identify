import { SnapProvider } from '@metamask/snap-types';
import { IdentitySnapState } from '../interfaces';
import { snapConfirm } from './snapUtils';
import { initSnapState } from './stateUtils';

/* eslint-disable */
export async function init(wallet: SnapProvider): Promise<IdentitySnapState> {
  const promptObj = {
    prompt: 'Terms and Conditions',
    description: 'Risks about using Identity Snap',
    textAreaContent:
      'Identity Snap does not access your private keys. You are in control of what VCs and VPs you sign and what you use your DIDs for.',
  };

  // Accept terms and conditions
  if (await snapConfirm(wallet, promptObj)) {
    console.log('starting init');
    return await initSnapState(wallet);
  } else {
    console.error('User did not accept terms and conditions!');
    throw new Error('User did not accept terms and conditions!');
  }
}
