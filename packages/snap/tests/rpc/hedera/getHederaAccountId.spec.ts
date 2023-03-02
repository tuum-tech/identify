/* eslint-disable */
import { MetaMaskInpageProvider } from '@metamask/providers';
import { SnapsGlobalObject } from '@metamask/snaps-types';
import { GoogleToken, IdentitySnapParams } from '../../../src/interfaces';
import { SnapMock } from '../../testUtils/snap.mock';

describe('GetHederaAccountId', () => {
  let identitySnapParams: IdentitySnapParams;
  let snapState: GoogleToken;
  let snapMock: SnapsGlobalObject & SnapMock;
  let metamask: MetaMaskInpageProvider;

  it('should return accountId', async () => {});
});
