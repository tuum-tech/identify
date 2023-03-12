import { GoogleToken, IdentitySnapParams } from '../../interfaces';
import { verifyToken } from '../../plugins/veramo/google-drive-data-store';
import { getCurrentCoinType, updateSnapState } from '../../snap/state';

export const configureGoogleAccount = async (
  identitySnapParams: IdentitySnapParams,
  { accessToken }: GoogleToken,
) => {
  const { snap, state, account } = identitySnapParams;
  try {
    await verifyToken(accessToken);
    const coinType = await getCurrentCoinType();
    state.accountState[coinType][
      account.evmAddress
    ].accountConfig.identity.googleAccessToken = accessToken;
    console.log('new state: ', JSON.stringify(state, null, 4));
    await updateSnapState(snap, state);
    return true;
  } catch (error) {
    console.error(
      'Could not configure google account',
      JSON.stringify(error, null, 4),
    );
    throw error;
  }
};
