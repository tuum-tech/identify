import { generateCommonPanel } from '../snap/dialog';
import { heading, text } from '@metamask/snaps-ui';
import {
  isValidConfigueGoogleRequest,
  isValidCreateNewHederaAccountParams, isValidCreateVCRequest, isValidCreateVPRequest, isValidDeleteAllVCsRequest,
  isValidGetVCsRequest, isValidRemoveVCRequest,
  isValidResolveDIDRequest,
  isValidSaveVCRequest, isValidSwitchMethodRequest, isValidVerifyVCRequest, isValidVerifyVPRequest,
} from '../utils/params';
import { createNewHederaAccount } from '../rpc/hedera/createNewHederaAccount';
import { CreateNewHederaAccountRequestParams } from '../types/params';
import { IdentitySnapParams } from '../interfaces';
import { resolveDID } from '../rpc/did/resolveDID';
import { getVCs } from '../rpc/vc/getVCs';
import { saveVC } from '../rpc/vc/saveVC';
import { createVC } from '../rpc/vc/createVC';
import { verifyVC } from '../rpc/vc/verifyVC';
import { removeVC } from '../rpc/vc/removeVC';
import { deleteAllVCs } from '../rpc/vc/deleteAllVCs';
import { createVP } from '../rpc/vc/createVP';
import { verifyVP } from '../rpc/vc/verifyVP';
import { switchDIDMethod } from '../rpc/did/switchDIDMethod';
import { configureGoogleAccount } from '../rpc/gdrive/configureGoogleAccount';

export class IdentifySnapFacade {
  public static async sendHello() {
    return snap.request({
      method: 'snap_dialog',
      params: {
        /*
          Type can be one of the following:
          - 'alert': for displaying information.
          - 'confirmation': for accepting or rejecting some action.
          - 'prompt': for inputting some information.
        */
        type: 'alert',
        content: await generateCommonPanel(origin, [
          heading('Hello from Identify Snap!'),
          text('This custom alert is just for display purposes.'),
        ]),
      },
    });
  }

  public static async createNewHederaAccount(request:any, identitySnapParams: IdentitySnapParams) {
    isValidCreateNewHederaAccountParams(request.params);
    return await createNewHederaAccount(
      identitySnapParams,
      request.params as CreateNewHederaAccountRequestParams,
    );
  }

  public static async resolveDID(request:any, identitySnapParams: IdentitySnapParams) {
    isValidResolveDIDRequest(request.params);
    return await resolveDID(identitySnapParams, request.params.did);
  }

  public static async getVCs(request:any, identitySnapParams: IdentitySnapParams) {
    isValidGetVCsRequest(request.params);
    return await getVCs(identitySnapParams, request.params);
  }

  public static async saveVC(request:any, identitySnapParams: IdentitySnapParams) {
    isValidSaveVCRequest(request.params);
    return await saveVC(identitySnapParams, request.params);
  }

  public static async createVC(request:any, identitySnapParams: IdentitySnapParams) {
    isValidCreateVCRequest(request.params);
    return await createVC(identitySnapParams, request.params);
  }

  public static async verifyVC(request:any, identitySnapParams: IdentitySnapParams) {
    isValidVerifyVCRequest(request.params);
    return await verifyVC(
      identitySnapParams,
      request.params.verifiableCredential,
    );
  }

  public static async removeVC(request:any, identitySnapParams: IdentitySnapParams) {
    isValidRemoveVCRequest(request.params);
    return await removeVC(identitySnapParams, request.params);
  }

  public static async deleteAllVCs(request:any, identitySnapParams: IdentitySnapParams) {
    isValidDeleteAllVCsRequest(request.params);
    return await deleteAllVCs(identitySnapParams, request.params);
  }

  public static async createVP(request:any, identitySnapParams: IdentitySnapParams) {
    isValidCreateVPRequest(request.params);
    return await createVP(identitySnapParams, request.params);
  }

  public static async verifyVP(request:any, identitySnapParams: IdentitySnapParams) {
    isValidVerifyVPRequest(request.params);
    return await verifyVP(
      identitySnapParams,
      request.params.verifiablePresentation,
    );
  }

  public static async switchDIDMethod(request:any, identitySnapParams: IdentitySnapParams) {
    isValidSwitchMethodRequest(request.params);
    return await switchDIDMethod(
      identitySnapParams,
      request.params.didMethod,
    );
  }

  public static async configureGoogleAccount(request:any, identitySnapParams: IdentitySnapParams) {
    isValidConfigueGoogleRequest(request.params);
    return await configureGoogleAccount(identitySnapParams, request.params);
  }
}
