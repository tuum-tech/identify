import { gapi, loadClientAuth2 } from 'gapi-script';

export const uploadToGoogleDrive = async ({
  fileName,
  content,
}: {
  fileName: string;
  content: string;
}) => {
  const file = new Blob([content], { type: 'text/plain' });
  const metadata = {
    name: fileName,
    mimeType: 'text/plain',
    // parents: ["root"], // Folder ID at Google Drive
  };

  if (!gapi.auth) {
    const clientId = process.env.REACT_APP_GOOGLE_DRIVE_CLIENT_ID || '';
    if (!clientId) {
      console.error('Google Drive Client id is missing.');
      return;
    }
    const scope = 'https://www.googleapis.com/auth/drive.file';
    await loadClientAuth2(gapi, clientId, scope);

    const config = {
      client_id: clientId,
      scope,
    };
    await gapi.auth.authorize(config, function () {
      console.log('login complete');
      console.log(gapi.auth.getToken());
    });
  }
  const accessToken = gapi.auth.getToken().access_token; // Here gapi is used for retrieving the access token.
  const form = new FormData();
  form.append(
    'metadata',
    new Blob([JSON.stringify(metadata)], { type: 'application/json' }),
  );
  form.append('file', file);

  fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id',
    {
      method: 'POST',
      headers: new Headers({ Authorization: `Bearer ${accessToken}` }),
      body: form,
    },
  )
    .then((res) => {
      return res.json();
    })
    .then(function (val) {
      console.log(val);
    });
};
