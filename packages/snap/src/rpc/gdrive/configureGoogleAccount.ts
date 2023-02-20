import { GoogleToken, IdentitySnapParams } from '../../interfaces';
import { verifyToken } from '../../utils/googleUtils';
import { updateSnapState } from '../../utils/stateUtils';

export const configureGoogleAccount = async (
  identitySnapParams: IdentitySnapParams,
  { accessToken }: GoogleToken,
) => {
  const { snap, state } = identitySnapParams;
  try {
    await verifyToken(accessToken);
    state.accountState[
      state.currentAccount
    ].accountConfig.identity.googleAccessToken = accessToken;
    await updateSnapState(snap, state);
    return true;
  } catch (error) {
    console.error('Could not configure google account', error);
    throw error;
  }
};
