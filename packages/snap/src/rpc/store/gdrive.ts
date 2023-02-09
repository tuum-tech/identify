import { SnapProvider } from '@metamask/snap-types';
import { GoogleToken, IdentitySnapState, UploadData } from 'src/interfaces';
import { updateSnapState } from '../../utils/stateUtils';

export const GOOGLE_DRIVE_VCS_FILE_NAME = 'identity-snap-vcs.json';

const searchFile = async (accessToken: string, fileName: string) => {
  try {
    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=name = '${fileName}' and trashed = false`,
      {
        method: 'GET',
        headers: new Headers({
          Authorization: `Bearer ${accessToken}`,
        }),
      },
    );
    const data = await res.json();
    console.log('searchFile: ', { data: JSON.stringify(data) });

    const count = data.files.length;

    return { count, id: count === 1 ? data.files[0].id : null };
  } catch (error) {
    console.error('Failed to search file', error);
    throw error;
  }
};

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

  const existFile = await searchFile(accessToken, fileName);

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
    let res;
    if (existFile.id) {
      res = await fetch(
        `https://www.googleapis.com/upload/drive/v3/files/${existFile.id}?uploadType=multipart&fields=id`,
        {
          method: 'PATCH',
          headers: new Headers({
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': `multipart/related; boundary=${boundary}`,
          }),
          body: multipartRequestBody,
        },
      );
    } else {
      res = await fetch(
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
    }
    const val = await res.json();
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

export const getFileContent = async (accessToken: string, fileId: string) => {
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
    {
      method: 'GET',
      headers: new Headers({
        Authorization: `Bearer ${accessToken}`,
      }),
    },
  );
  return res.json();
};

export const getGoogleVCs = async (
  state: IdentitySnapState,
  fileName: string,
) => {
  const accessToken =
    state.accountState[state.currentAccount].accountConfig.identity
      .googleAccessToken;
  if (!accessToken) {
    console.error('Access token not found');
    return false;
  }

  const existFile = await searchFile(accessToken, fileName);

  if (existFile.id) {
    const content = await getFileContent(accessToken, existFile.id);
    return JSON.parse(content);
  }
  return null;
};
