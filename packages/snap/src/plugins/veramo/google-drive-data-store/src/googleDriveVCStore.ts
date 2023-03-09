import { SnapsGlobalObject } from '@metamask/snaps-types';
import { W3CVerifiableCredential } from '@veramo/core';
import jsonpath from 'jsonpath';
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

  accessToken: string;

  constructor(snap: SnapsGlobalObject) {
    super();
    this.snap = snap;
    this.accessToken = '';
  }

  async queryVC(args: IFilterArgs): Promise<IQueryResult[]> {
    const { filter } = args;
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
          const obj = [
            {
              metadata: { id: filter.filter as string },
              data: vc,
            },
          ];
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
          return item.data.type?.includes(filter.filter as string);
        });
    }

    if (filter === undefined || (filter && filter.type === 'none')) {
      return Object.keys(googleVCs).map((k) => {
        let vc = googleVCs[k] as unknown;
        if (typeof vc === 'string') {
          vc = decodeJWT(vc);
        }
        return {
          metadata: { id: k },
          data: vc,
        };
      });
    }

    if (filter && filter.type === 'JSONPath') {
      const objects = Object.keys(googleVCs).map((k) => {
        let vc = googleVCs[k] as unknown;
        if (typeof vc === 'string') {
          vc = decodeJWT(vc);
        }
        return {
          metadata: { id: k },
          data: vc,
        };
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
    const saveVcs: string[] = [];
    vcs.map(async (vc) => {
      const savedId = await this.save({
        data: vc.vc as W3CVerifiableCredential,
        id: vc.id as string,
      });
      saveVcs.push(savedId);
    });
    return saveVcs;
  }

  async save(args: {
    data: W3CVerifiableCredential;
    id: string;
  }): Promise<string> {
    // TODO check if VC is correct type
    const { data: vc, id } = args;

    const newId = id || uuidv4();

    let googleVCs = await getGoogleVCs(
      this.accessToken,
      GOOGLE_DRIVE_VCS_FILE_NAME,
    );

    if (!googleVCs) {
      await createEmptyFile(this.accessToken, GOOGLE_DRIVE_VCS_FILE_NAME);
      googleVCs = {};
    }

    const newVCs = { ...googleVCs, [newId]: vc };
    const gdriveResponse = await uploadToGoogleDrive(this.accessToken, {
      fileName: GOOGLE_DRIVE_VCS_FILE_NAME,
      content: JSON.stringify(newVCs),
    });
    console.log({ gdriveResponse });

    return newId;
  }

  async deleteVC({ id }: { id: string }): Promise<boolean> {
    const googleVCs = await getGoogleVCs(
      this.accessToken,
      GOOGLE_DRIVE_VCS_FILE_NAME,
    );

    if (!googleVCs) {
      console.log('Invalid vcs file');
      return false;
    }

    if (!googleVCs[id]) {
      throw Error(`VC ID '${id}' not found`);
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
    const gdriveResponse = await uploadToGoogleDrive(this.accessToken, {
      fileName: GOOGLE_DRIVE_VCS_FILE_NAME,
      content: JSON.stringify({}),
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
