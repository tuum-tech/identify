import { SnapProvider } from '@metamask/snap-types';
import { GoogleToken, IdentitySnapState, UploadData } from 'src/interfaces';
import { updateSnapState } from '../../utils/stateUtils';

export const uploadToGoogleDrive = async (
  state: IdentitySnapState,
  { fileName, content }: UploadData,
) => {
  const accessToken =
    state.accountState[state.currentAccount].accountConfig.identity
      .googleAccessToken;
  if (!accessToken) {
    console.error('Access token not found');
    return false;
  }

  const metadata = {
    name: fileName,
    mimeType: 'text/plain',
    // parents: ["root"], // Folder ID at Google Drive
  };

  const boundary = '314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelim = `\r\n--${boundary}--`;

  let multipartRequestBody = `${delimiter}Content-Type: application/json\r\n\r\n${JSON.stringify(
    metadata,
  )}${delimiter}Content-Type: text/plain\r\n`;
  multipartRequestBody += `\r\n${content}`;
  multipartRequestBody += closeDelim;

  try {
    const res = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id',
      {
        method: 'POST',
        headers: new Headers({
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': `multipart/related; boundary=${boundary}`,
        }),
        body: multipartRequestBody,
      },
    );
    const val = res.json();
    console.log({ val });

    return val;
  } catch (error) {
    console.error('Could not upload to google drive', error);
    return false;
  }
};

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
    return false;
  }
};
