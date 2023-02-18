import { IdentitySnapState, UploadData } from 'src/interfaces';

export const GOOGLE_DRIVE_VCS_FILE_NAME = 'identity-snap-vcs.json';
const BOUNDARY = '314159265358979323846';

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

const getRequestBodyToUpload = ({ fileName, content }: UploadData) => {
  const metadata = {
    name: fileName,
    mimeType: 'text/plain',
    // parents: ["root"], // Folder ID at Google Drive
  };

  const delimiter = `\r\n--${BOUNDARY}\r\n`;
  const closeDelim = `\r\n--${BOUNDARY}--`;

  let multipartRequestBody = `${delimiter}Content-Type: application/json\r\n\r\n${JSON.stringify(
    metadata,
  )}${delimiter}Content-Type: text/plain\r\n`;
  multipartRequestBody += `\r\n${content}`;
  multipartRequestBody += closeDelim;

  return multipartRequestBody;
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
  const multipartRequestBody = getRequestBodyToUpload({ fileName, content });

  try {
    let res;
    if (existFile.id) {
      res = await fetch(
        `https://www.googleapis.com/upload/drive/v3/files/${existFile.id}?uploadType=multipart&fields=id`,
        {
          method: 'PATCH',
          headers: new Headers({
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': `multipart/related; boundary=${BOUNDARY}`,
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
            'Content-Type': `multipart/related; boundary=${BOUNDARY}`,
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

export const createEmptyFile = async (
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

  const multipartRequestBody = getRequestBodyToUpload({
    fileName,
    content: '{}',
  });

  try {
    const res = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id',
      {
        method: 'POST',
        headers: new Headers({
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': `multipart/related; boundary=${BOUNDARY}`,
        }),
        body: multipartRequestBody,
      },
    );
    const val = await res.json();

    return val;
  } catch (error) {
    console.error('Could not create file on google drive', error);
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
    throw new Error('Google account was not configured');
  }

  const existFile = await searchFile(accessToken, fileName);

  if (existFile.id) {
    const content = await getFileContent(accessToken, existFile.id);
    return content;
  }
  return null;
};
