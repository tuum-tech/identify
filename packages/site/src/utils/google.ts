import { gapi, loadClientAuth2 } from 'gapi-script';

export const getAccessToken = async () => {
  if (!gapi.auth) {
    const clientId = process.env.GATSBY_GOOGLE_DRIVE_CLIENT_ID || '';
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
