import { SnapsGlobalObject } from '@metamask/snaps-types';
import { W3CVerifiableCredential } from '@veramo/core';
import jsonpath from 'jsonpath';
import { v4 as uuidv4 } from 'uuid';
import { getSnapState } from '../../rpc/snap/state';
import {
  createEmptyFile,
  getGoogleVCs,
  GOOGLE_DRIVE_VCS_FILE_NAME,
  uploadToGoogleDrive,
} from '../../utils/googleUtils';
import { decodeJWT } from '../../utils/jwt';
import {
  AbstractDataStore,
  IFilterArgs,
  IQueryResult,
} from './verfiable-creds-manager';

/**
 * An implementation of {@link AbstractDataStore} that holds everything in snap state.
 *
 * This is usable by {@link @vc-manager/VCManager} to hold the vc data
 */
export class GoogleDriveVCStore extends AbstractDataStore {
  snap: SnapsGlobalObject;

  constructor(snap: SnapsGlobalObject) {
    super();
    this.snap = snap;
  }

  async queryVC(args: IFilterArgs): Promise<IQueryResult[]> {
    const { filter } = args;
    const state = await getSnapState(this.snap);
    const googleVCs = await getGoogleVCs(state, GOOGLE_DRIVE_VCS_FILE_NAME);

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
    data: W3CVerifiableCredential;
    id: string;
  }): Promise<string> {
    // TODO check if VC is correct type
    const { data: vc, id } = args;
    const state = await getSnapState(this.snap);
    const account = state.currentAccount;
    if (!account) {
      throw Error(
        `GoogleDriveVCStore - Cannot get current account: ${account}`,
      );
    }

    const newId = id || uuidv4();

    let googleVCs = await getGoogleVCs(state, GOOGLE_DRIVE_VCS_FILE_NAME);

    if (!googleVCs) {
      await createEmptyFile(state, GOOGLE_DRIVE_VCS_FILE_NAME);
      googleVCs = {};
    }

    const newVCs = { ...googleVCs, [newId]: vc };
    const gdriveResponse = await uploadToGoogleDrive(state, {
      fileName: GOOGLE_DRIVE_VCS_FILE_NAME,
      content: JSON.stringify(newVCs),
    });
    console.log({ gdriveResponse });

    return newId;
  }

  async deleteVC({ id }: { id: string }): Promise<boolean> {
    const state = await getSnapState(this.snap);
    const googleVCs = await getGoogleVCs(state, GOOGLE_DRIVE_VCS_FILE_NAME);

    if (!googleVCs) {
      console.log('Invalid vcs file');
      return false;
    }

    if (!googleVCs[id]) {
      throw Error(`VC ID '${id}' not found`);
    }

    delete googleVCs[id];
    const gdriveResponse = await uploadToGoogleDrive(state, {
      fileName: GOOGLE_DRIVE_VCS_FILE_NAME,
      content: JSON.stringify(googleVCs),
    });
    console.log({ gdriveResponse });

    return true;
  }

  public async clearVCs(_args: IFilterArgs): Promise<boolean> {
    const state = await getSnapState(this.snap);
    const gdriveResponse = await uploadToGoogleDrive(state, {
      fileName: GOOGLE_DRIVE_VCS_FILE_NAME,
      content: JSON.stringify({}),
    });
    console.log({ gdriveResponse });

    return true;
  }
}
