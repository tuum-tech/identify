import { OnRpcRequestHandler } from '@metamask/snaps-types';
import {
  OnHomePageHandler,
  OnInstallHandler,
  OnUserInputHandler,
  UserInputEventType,
} from '@metamask/snaps-sdk';
import { Account, ExternalAccount, IdentitySnapParams } from './interfaces';
import { getAccountInfo } from './rpc/account/getAccountInfo';
import { getAvailableDIDMethods } from './rpc/did/getAvailableDIDMethods';
import { getCurrentDIDMethod } from './rpc/did/getCurrentDIDMethod';
import { togglePopups } from './rpc/snap/togglePopups';
import { getSupportedProofFormats } from './rpc/vc/getSupportedProofFormats';
import { syncGoogleVCs } from './rpc/vc/syncGoogleVCs';
import { getCurrentAccount } from './snap/account';
import { getSnapStateUnchecked } from './snap/state';
import { init } from './utils/init';
import {
  isExternalAccountFlagSet,
  isValidMetamaskAccountParams,
} from './utils/params';
import { IdentifySnapFacade } from './snap-classes/IdentifySnapFacade';

export const onInstall: OnInstallHandler = async () => {

};

export const onUserInput: OnUserInputHandler = async ({
                                                        id,
                                                        event,
                                                        context,
                                                      }) => {

};

/**
 * Handle incoming JSON-RPC requests, sent through `wallet_invokeSnap`.
 *
 * @param args - The request handler args as object.
 * @param args.request - A validated JSON-RPC request object.
 * @param args.origin - Origin of the request.
 * @returns `null` if the request succeeded.
 * @throws If the request method is not valid for this snap.
 */
export const onRpcRequest: OnRpcRequestHandler = async ({
  origin,
  request,
}) => {
  console.log('Request:', JSON.stringify(request, null, 4));
  console.log('Origin:', origin);
  console.log('-------------------------------------------------------------');
  console.log(
    'request.params=========',
    JSON.stringify(request.params, null, 4),
  );

  let state = await getSnapStateUnchecked(snap);
  if (state === null) {
    state = await init(snap);
  }
  console.log('state:', JSON.stringify(state, null, 4));

  let isExternalAccount: boolean;
  let extraData: unknown;
  if (isExternalAccountFlagSet(request.params)) {
    isExternalAccount = true;
    extraData = (request.params as ExternalAccount).externalAccount.data;
  } else {
    isExternalAccount = false;
    isValidMetamaskAccountParams(request.params);
  }

  const account: Account = await getCurrentAccount(
    state,
    request.params,
    isExternalAccount,
  );
  account.extraData = extraData;

  console.log(`Current account: ${JSON.stringify(account, null, 4)}`);

  const identitySnapParams: IdentitySnapParams = {
    origin,
    snap,
    state,
    metamask: ethereum,
    account,
  };

  switch (request.method) {
    case 'hello': {
      return await IdentifySnapFacade.sendHello();
    }

    case 'togglePopups': {
      return await togglePopups(identitySnapParams);
    }

    case 'getAccountInfo': {
      return await getAccountInfo(identitySnapParams);
    }

    case 'createNewHederaAccount': {
      return await IdentifySnapFacade.createNewHederaAccount(request, identitySnapParams);
    }

    case 'resolveDID': {
      return await IdentifySnapFacade.resolveDID(request, identitySnapParams);
    }

    case 'getVCs': {
     return await IdentifySnapFacade.getVCs(request, identitySnapParams);
    }

    case 'saveVC': {
      return await IdentifySnapFacade.saveVC(request, identitySnapParams);
    }

    case 'createVC': {
      return await IdentifySnapFacade.createVC(request, identitySnapParams);
    }

    case 'verifyVC': {
      return await IdentifySnapFacade.verifyVC(request, identitySnapParams);
    }

    case 'removeVC': {
      return await IdentifySnapFacade.removeVC(request, identitySnapParams);
    }

    case 'deleteAllVCs': {
      return await IdentifySnapFacade.deleteAllVCs(request, identitySnapParams);
    }

    case 'createVP': {
      return await IdentifySnapFacade.createVP(request, identitySnapParams);
    }

    case 'verifyVP': {
      return await IdentifySnapFacade.verifyVP(request, identitySnapParams);
    }

    case 'getAvailableMethods': {
      return getAvailableDIDMethods();
    }

    case 'getCurrentDIDMethod': {
      return getCurrentDIDMethod(identitySnapParams);
    }

    case 'switchDIDMethod': {
      return IdentifySnapFacade.switchDIDMethod(request, identitySnapParams);
    }

    case 'getSupportedProofFormats': {
      return getSupportedProofFormats();
    }

    case 'configureGoogleAccount': {
      return await IdentifySnapFacade.configureGoogleAccount(request, identitySnapParams);
    }

    case 'syncGoogleVCs': {
      return await syncGoogleVCs(identitySnapParams);
    }

    default: {
      console.error('Method not found');
      throw new Error('Method not found');
    }
  }
};
