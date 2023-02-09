import { SnapProvider } from '@metamask/snap-types';
import { GoogleToken, IdentitySnapState } from 'src/interfaces';
import { updateSnapState } from '../../utils/stateUtils';

export const configureGoogleAccount = async (
  wallet: SnapProvider,
  state: IdentitySnapState,
  params: GoogleToken,
) => {
  try {
    state.accountState[
      state.currentAccount
    ].accountConfig.identity.googleAccessToken = params.accessToken;
    await updateSnapState(wallet, state);
    return true;
  } catch (error) {
    console.error('Could not configure google account', error);
    throw error;
  }
};
