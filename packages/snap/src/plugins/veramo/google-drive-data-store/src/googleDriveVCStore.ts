import { SnapsGlobalObject } from '@metamask/snaps-types';
import { VerifiableCredential } from '@veramo/core';
import jsonpath from 'jsonpath';
import { IdentitySnapState } from 'src/interfaces';
import { v4 as uuidv4 } from 'uuid';
import {
  AbstractDataStore,
  IConfigureArgs,
  IFilterArgs,
  IQueryResult,
  ISaveVC,
} from '../../verfiable-creds-manager';
import {
  createEmptyFile,
  getGoogleVCs,
  GOOGLE_DRIVE_VCS_FILE_NAME,
  uploadToGoogleDrive,
  verifyToken,
} from './googleUtils';
import { decodeJWT } from './jwt';

/**
 * An implementation of {@link AbstractDataStore} that holds everything in snap state.
 *
 * This is usable by {@link @vc-manager/VCManager} to hold the vc data
 */
export class GoogleDriveVCStore extends AbstractDataStore {
  snap: SnapsGlobalObject;

  state: IdentitySnapState;

  accessToken: string;

  constructor(snap: SnapsGlobalObject, state: IdentitySnapState) {
    super();
    this.snap = snap;
    this.state = state;
    this.accessToken = '';
  }

  async queryVC(args: IFilterArgs): Promise<IQueryResult[]> {
    const { filter } = args;
    const account = this.state.currentAccount.evmAddress;
    if (!account) {
      throw Error(`SnapVCStore - Cannot get current account: ${account}`);
    }

    const googleVCs = await getGoogleVCs(
      this.accessToken,
      GOOGLE_DRIVE_VCS_FILE_NAME,
    );

    if (!googleVCs) {
      console.log('Invalid vcs file');
      return [];
    }

    if (filter && filter.type === 'id') {
      try {
        if (googleVCs[filter.filter as string]) {
          let vc = googleVCs[filter.filter as string] as unknown;
          if (typeof vc === 'string') {
            vc = decodeJWT(vc);
          }
          const obj =
            (vc as VerifiableCredential).credentialSubject.id?.split(':')[4] ===
            account
              ? [
                  {
                    metadata: { id: filter.filter as string },
                    data: vc,
                  },
                ]
              : [];
          return obj;
        }
        return [];
      } catch (e) {
        throw new Error('Invalid id');
      }
    }

    if (filter && filter.type === 'vcType') {
      return Object.keys(googleVCs)
        .map((k) => {
          let vc = googleVCs[k] as unknown;
          if (typeof vc === 'string') {
            vc = decodeJWT(vc);
          }

          return {
            metadata: { id: k },
            data: vc,
          };
        })
        .filter((item: any) => {
          return (
            item.data.type?.includes(filter.filter as string) &&
            item.data.credentialSubject.id?.split(':')[4] === account
          );
        });
    }

    if (filter === undefined || (filter && filter.type === 'none')) {
      return Object.keys(googleVCs)
        .map((k) => {
          let vc = googleVCs[k] as unknown;
          if (typeof vc === 'string') {
            vc = decodeJWT(vc);
          }
          return {
            metadata: { id: k },
            data: vc,
          };
        })
        .filter((item: any) => {
          return item.data.credentialSubject.id?.split(':')[4] === account;
        });
    }

    if (filter && filter.type === 'JSONPath') {
      const objects = Object.keys(googleVCs)
        .map((k) => {
          let vc = googleVCs[k] as unknown;
          if (typeof vc === 'string') {
            vc = decodeJWT(vc);
          }
          return {
            metadata: { id: k },
            data: vc,
          };
        })
        .filter((item: any) => {
          return item.data.credentialSubject.id?.split(':')[4] === account;
        });
      const filteredObjects = jsonpath.query(objects, filter.filter as string);
      return filteredObjects as IQueryResult[];
    }
    return [];
  }

  async saveVC(args: {
    data: ISaveVC[];
    options?: unknown;
  }): Promise<string[]> {
    const { data: vcs } = args;
    const account = this.state.currentAccount.evmAddress;
    if (!account) {
      throw Error(`SnapVCStore - Cannot get current account: ${account}`);
    }

    let googleVCs = await getGoogleVCs(
      this.accessToken,
      GOOGLE_DRIVE_VCS_FILE_NAME,
    );

    if (!googleVCs) {
      await createEmptyFile(this.accessToken, GOOGLE_DRIVE_VCS_FILE_NAME);
      googleVCs = {};
    }

    const ids: string[] = [];
    let newVCs = { ...googleVCs };
    for (const vc of vcs) {
      if (
        (vc.vc as VerifiableCredential).credentialSubject.id?.split(':')[4] ===
        account
      ) {
        const newId = vc.id || uuidv4();
        newVCs = { ...newVCs, [newId]: vc.vc };
        ids.push(newId);
      }
    }

    await uploadToGoogleDrive(this.accessToken, {
      fileName: GOOGLE_DRIVE_VCS_FILE_NAME,
      content: JSON.stringify(newVCs),
    });

    return ids;
  }

  async deleteVC({ id }: { id: string }): Promise<boolean> {
    const account = this.state.currentAccount.evmAddress;
    if (!account) {
      throw Error(`SnapVCStore - Cannot get current account: ${account}`);
    }

    const googleVCs = await getGoogleVCs(
      this.accessToken,
      GOOGLE_DRIVE_VCS_FILE_NAME,
    );

    if (!googleVCs) {
      console.log('Invalid vcs file');
      return false;
    }

    if (!googleVCs[id]) {
      console.log(`VC ID '${id}' not found`);
      throw Error(`VC ID '${id}' not found`);
    }

    if (
      (googleVCs[id] as VerifiableCredential).credentialSubject.id?.split(
        ':',
      )[4] !== account
    ) {
      console.log(
        `VC ID '${id}' does not belong to the currently connected Metamask account. Skipping...`,
      );
      return false;
    }

    delete googleVCs[id];
    const gdriveResponse = await uploadToGoogleDrive(this.accessToken, {
      fileName: GOOGLE_DRIVE_VCS_FILE_NAME,
      content: JSON.stringify(googleVCs),
    });
    console.log({ gdriveResponse });

    return true;
  }

  public async clearVCs(_args: IFilterArgs): Promise<boolean> {
    const account = this.state.currentAccount.evmAddress;
    if (!account) {
      throw Error(`SnapVCStore - Cannot get current account: ${account}`);
    }

    let googleVCs = await getGoogleVCs(
      this.accessToken,
      GOOGLE_DRIVE_VCS_FILE_NAME,
    );

    if (!googleVCs) {
      await createEmptyFile(this.accessToken, GOOGLE_DRIVE_VCS_FILE_NAME);
      console.log(
        'Google drive does not have any VCs associated with the currently connected Metamask account. Skipping...',
      );
      return false;
    }

    googleVCs = Object.keys(googleVCs).filter((vcId: any) => {
      return googleVCs[vcId].credentialSubject.id?.split(':')[4] === account;
    });

    const gdriveResponse = await uploadToGoogleDrive(this.accessToken, {
      fileName: GOOGLE_DRIVE_VCS_FILE_NAME,
      content: JSON.stringify(googleVCs),
    });
    console.log({ gdriveResponse });

    return true;
  }

  public async configure({ accessToken }: IConfigureArgs): Promise<boolean> {
    try {
      await verifyToken(accessToken);
      this.accessToken = accessToken;

      return true;
    } catch (error) {
      console.error('Could not configure google account', error);
      throw error;
    }
  }
}
