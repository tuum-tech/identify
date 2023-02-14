import { SnapProvider } from '@metamask/snap-types';
import { W3CVerifiableCredential } from '@veramo/core';
import { v4 as uuidv4 } from 'uuid';
import { IdentitySnapState } from '../../interfaces';
import {
  getGoogleVCs,
  GOOGLE_DRIVE_VCS_FILE_NAME,
  uploadToGoogleDrive,
} from '../../utils/googleUtils';
import {
  AbstractDataStore,
  IFilterArgs,
  IQueryResult,
} from './verfiable-creds-manager';

/* eslint-disable */
/**
 * An implementation of {@link AbstractDataStore} that holds everything in snap state.
 *
 * This is usable by {@link @vc-manager/VCManager} to hold the vc data
 */
export class GoogleDriveVCStore extends AbstractDataStore {
  wallet: SnapProvider;
  state: IdentitySnapState;

  constructor(wallet: SnapProvider, state: IdentitySnapState) {
    super();
    this.wallet = wallet;
    this.state = state;
  }

  async query(args: IFilterArgs): Promise<Array<IQueryResult>> {
    const { filter } = args;
    const account = this.state.currentAccount;
    if (!account)
      throw Error(
        `GoogleDriveVCStore - Cannot get current account: ${account}`,
      );

    // if (filter && filter.type === 'id') {
    //   try {
    //     if (this.state.accountState[account].vcs[filter.filter as string]) {
    //       let vc = this.state.accountState[account].vcs[
    //         filter.filter as string
    //       ] as unknown;
    //       if (typeof vc === 'string') {
    //         vc = decodeJWT(vc);
    //       }
    //       const obj = [
    //         {
    //           metadata: { id: filter.filter as string },
    //           data: vc,
    //         },
    //       ];
    //       return obj;
    //     } else return [];
    //   } catch (e) {
    //     throw new Error('Invalid id');
    //   }
    // }
    // if (filter === undefined || (filter && filter.type === 'none')) {
    //   return Object.keys(this.state.accountState[account].vcs).map((k) => {
    //     let vc = this.state.accountState[account].vcs[k] as unknown;
    //     if (typeof vc === 'string') {
    //       vc = decodeJWT(vc);
    //     }
    //     return {
    //       metadata: { id: k },
    //       data: vc,
    //     };
    //   });
    // }
    // if (filter && filter.type === 'JSONPath') {
    //   const objects = Object.keys(this.state.accountState[account].vcs).map(
    //     (k) => {
    //       let vc = this.state.accountState[account].vcs[k] as unknown;
    //       if (typeof vc === 'string') {
    //         vc = decodeJWT(vc);
    //       }
    //       return {
    //         metadata: { id: k },
    //         data: vc,
    //       };
    //     },
    //   );
    //   const filteredObjects = jsonpath.query(objects, filter.filter as string);
    //   return filteredObjects as Array<IQueryResult>;
    // }
    return [];
  }

  async save(args: {
    data: W3CVerifiableCredential;
    id: string;
  }): Promise<string> {
    // TODO check if VC is correct type

    const { data: vc, id } = args;
    const account = this.state.currentAccount;
    if (!account)
      throw Error(
        `GoogleDriveVCStore - Cannot get current account: ${account}`,
      );

    let newId = id || uuidv4();

    const googleVCs = await getGoogleVCs(
      this.state,
      GOOGLE_DRIVE_VCS_FILE_NAME,
    );

    if (!googleVCs) {
      throw new Error('Invalid vcs file');
    }

    const newVCs = { ...googleVCs, [newId]: vc };
    const gdriveResponse = await uploadToGoogleDrive(this.state, {
      fileName: GOOGLE_DRIVE_VCS_FILE_NAME,
      content: JSON.stringify(newVCs),
    });
    console.log({ gdriveResponse });

    return newId;
  }

  async delete({ id }: { id: string }): Promise<boolean> {
    const googleVCs = await getGoogleVCs(
      this.state,
      GOOGLE_DRIVE_VCS_FILE_NAME,
    );

    if (!googleVCs) {
      throw new Error('Invalid vcs file');
    }

    if (!googleVCs[id]) throw Error(`VC ID '${id}' not found`);

    delete googleVCs[id];
    const gdriveResponse = await uploadToGoogleDrive(this.state, {
      fileName: GOOGLE_DRIVE_VCS_FILE_NAME,
      content: JSON.stringify(googleVCs),
    });
    console.log({ gdriveResponse });

    return true;
  }

  public async clear(args: IFilterArgs): Promise<boolean> {
    const account = this.state.currentAccount;
    if (!account)
      throw Error(
        `GoogleDriveVCStore - Cannot get current account: ${account}`,
      );

    // this.state.accountState[account].vcs = {};
    // await updateSnapState(this.wallet, this.state);
    return true;
  }
}
