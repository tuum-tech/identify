import { GoogleToken, IdentitySnapParams } from '../../interfaces';
import { updateSnapState } from '../../utils/stateUtils';

export const configureGoogleAccount = async (
  identitySnapParams: IdentitySnapParams,
  googleTokenParams: GoogleToken,
) => {
  const { snap, state } = identitySnapParams;
  try {
    state.accountState[
      state.currentAccount
    ].accountConfig.identity.googleAccessToken = googleTokenParams.accessToken;
    await updateSnapState(snap, state);
    return true;
  } catch (error) {
    console.error('Could not configure google account', error);
    throw error;
  }
};
