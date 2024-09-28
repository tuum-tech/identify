import { ExternalAccount, IdentitySnapState } from '../interfaces';
import { getSnapStateUnchecked } from '../snap/state';
import { init } from '../utils/init';
import { JsonRpcRequest } from '@metamask/snaps-types';
import { Json } from '@metamask/snaps-sdk';
import { isExternalAccountFlagSet, isValidMetamaskAccountParams } from '../utils/params';
import { ExternalAccountInfo } from '../types/snap-info';

export class IdentifyUtils {
  public static async initializeSnap() : Promise<IdentitySnapState> {
    let state = await getSnapStateUnchecked(snap);
    if (state === null) {
      state = await init(snap);
    }

    return state;
  }

  public static checkExternalAccount(request: any): ExternalAccountInfo {
    const externalAccountInfo: ExternalAccountInfo = {
      isExternalAccount:false,
      extraData:null
    };

    if (isExternalAccountFlagSet(request.params)) {
      externalAccountInfo.isExternalAccount = true;
      externalAccountInfo.extraData = (request.params as ExternalAccount).externalAccount.data;
    }
    else {
      isValidMetamaskAccountParams(request.params);
    }

    return externalAccountInfo;
  }
}
