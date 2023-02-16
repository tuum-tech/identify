import { SnapsGlobalObject } from '@metamask/snaps-types';
import { IdentitySnapState } from '../interfaces';
import { snapConfirm } from './snapUtils';
import { initSnapState } from './stateUtils';

/* eslint-disable */
export async function init(
  snap: SnapsGlobalObject
): Promise<IdentitySnapState> {
  const promptObj = {
    prompt: 'Terms and Conditions',
    description: 'Risks about using Identity Snap',
    textAreaContent:
      'Applications do NOT have access to your private keys. You are in control of what VCs and VPs you sign and what you use your DIDs for.',
  };

  // Accept terms and conditions
  if (await snapConfirm(snap, promptObj)) {
    console.log('starting init');
    return await initSnapState(snap);
  } else {
    console.error('User did not accept terms and conditions!');
    throw new Error('User did not accept terms and conditions!');
  }
}
