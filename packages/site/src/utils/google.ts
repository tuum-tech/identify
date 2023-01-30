import { gapi, loadClientAuth2 } from 'gapi-script';

const REACT_APP_GOOGLE_DRIVE_CLIENT_ID =
  '887158910376-tdfiqpevpvd5ua9bdqp0nu5nejf3dht5.apps.googleusercontent.com';

export const getAccessToken = async () => {
  if (!gapi.auth) {
    const clientId = REACT_APP_GOOGLE_DRIVE_CLIENT_ID || '';
    if (!clientId) {
      console.error('Google Drive Client id is missing.');
      return null;
    }
    const scope = 'https://www.googleapis.com/auth/drive.file';
    await loadClientAuth2(gapi, clientId, scope);

    const config = {
      client_id: clientId,
      scope,
    };
    gapi.auth.authorize(config, function () {
      console.log('login complete');
      console.log(gapi.auth.getToken());
    });
  }
  const accessToken = gapi.auth.getToken().access_token; // Here gapi is used for retrieving the access token.

  return accessToken;
};
