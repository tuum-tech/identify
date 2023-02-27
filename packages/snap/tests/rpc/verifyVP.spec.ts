import { SnapProvider } from '@metamask/snap-types';
import { VerifiablePresentation } from '@veramo/core';
import { IdentitySnapState } from '../../src/interfaces';
import { connectHederaAccount } from '../../src/rpc/hedera/connectHederaAccount';
import { createVC } from '../../src/rpc/vc/createVC';
import { createVP } from '../../src/rpc/vc/createVP';
import { verifyVP } from '../../src/rpc/vc/verifyVP';

import { getDefaultSnapState } from '../testUtils/constants';
import { createMockWallet, WalletMock } from '../testUtils/wallet.mock';

jest.mock('uuid');

  describe.skip('VerifyVP', () => {
    let walletMock: SnapProvider & WalletMock;
    let snapState: IdentitySnapState;
    
    beforeEach( async() => {
      snapState = getDefaultSnapState();
      walletMock = createMockWallet();
      walletMock.rpcMocks.eth_chainId.mockReturnValue('0x128');

      let privateKey = '2386d1d21644dc65d4e4b9e2242c5f155cab174916cbc46ad85622cdaeac835c';
      let connected = await connectHederaAccount(snapState, privateKey, '0.0.15215', walletMock);
    });

    it('should verify valid VP', async () => {

      // Setup
      walletMock.rpcMocks.snap_confirm.mockReturnValue(true);

      // create VC 
      let vcCreatedResult = await createVC(walletMock, snapState, { vcValue: {'prop':10} });
      //let vc = await getVCs(walletMock, snapState, {filter: {type: 'id', filter: vcCreatedResult[0].id}})

      // create VP 
      let verifiablePresentation = await createVP(walletMock, snapState, {vcs: [vcCreatedResult[0].id as string]});

      await expect(verifyVP(walletMock, snapState, verifiablePresentation as VerifiablePresentation)).resolves.toBe(true); 
      expect.assertions(1);
    });


      it('should refuse validation when VP is adultered', async () => {

         // Setup
      walletMock.rpcMocks.snap_confirm.mockReturnValue(true);

      // create VC 
      let vcCreatedResult = await createVC(walletMock, snapState, { vcValue: {'prop':10} });
      //let vc = await getVCs(walletMock, snapState, {filter: {type: 'id', filter: vcCreatedResult[0].id}})

      // create VP 
      let verifiablePresentation = await createVP(walletMock, snapState, {vcs: [vcCreatedResult[0].id as string]});


      let adultered = JSON.parse(JSON.stringify(verifiablePresentation));

      adultered["proof"]["jwt"] = "1.eyJhbGciOiJFUzI1NksiLCJ0eXAiOiJKV1QifQ.eyJ2cCI6eyJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MSJdLCJ0eXBlIjpbIlZlcmlmaWFibGVQcmVzZW50YXRpb24iLCJDdXN0b20iXSwidmVyaWZpYWJsZUNyZWRlbnRpYWwiOlsiZXlKaGJHY2lPaUpGVXpJMU5rc2lMQ0owZVhBaU9pSktWMVFpZlEuZXlKbGVIQWlPakUzTURneU56a3lPRElzSW5aaklqcDdJa0JqYjI1MFpYaDBJanBiSW1oMGRIQnpPaTh2ZDNkM0xuY3pMbTl5Wnk4eU1ERTRMMk55WldSbGJuUnBZV3h6TDNZeElsMHNJblI1Y0dVaU9sc2lWbVZ5YVdacFlXSnNaVU55WldSbGJuUnBZV3dpWFN3aVkzSmxaR1Z1ZEdsaGJGTjFZbXBsWTNRaU9uc2lkbU5FWVhSaElqcDdJbkJ5YjNBaU9qRXdmU3dpYUdWa1pYSmhRV05qYjNWdWRFbGtJam9pTUM0d0xqRTFNakUxSW4xOUxDSnBjM04xWlhJaU9uc2lhR1ZrWlhKaFFXTmpiM1Z1ZEVsa0lqb2lNQzR3TGpFMU1qRTFJbjBzSW5OMVlpSTZJbVJwWkRwd2EyZzZaV2x3TVRVMU9qSTVOam93ZURka09EY3haakF3Tm1RNU56UTVPR1ZoTXpNNE1qWTRZVGsxTm1GbU9UUmhZakpsTmpWalpHUWlMQ0p1WW1ZaU9qRTJOelkzTkRNeU9ESXNJbWx6Y3lJNkltUnBaRHB3YTJnNlpXbHdNVFUxT2pJNU5qb3dlRGRrT0RjeFpqQXdObVE1TnpRNU9HVmhNek00TWpZNFlUazFObUZtT1RSaFlqSmxOalZqWkdRaWZRLmRySGdXTzhSM0lBaHZTbEJZTFNLNnlObnJkTjMwRDkwZFluSmUxN1FtclZ3cS1nU2psQ2REd1dnV1pzRFFxRXZlblRoSHpLeHZIRVVkbmN2Q0xyTkZnIl19LCJuYmYiOjE2NzY3NDMyODIsImlzcyI6ImRpZDpwa2g6ZWlwMTU1OjI5NjoweDdkODcxZjAwNmQ5NzQ5OGVhMzM4MjY4YTk1NmFmOTRhYjJlNjVjZGQifQ.3rRRKLtrTcsiAzXHgmQVjZOG2YZKBxomIwbZC6nFPaUNyaBTLOLEw8ZAmVpdWRXA-K7OjlPtcyaz4IMn-iaUlg";

      //console.log("adultered Presentation " + JSON.stringify(adultered));

      await expect(verifyVP(walletMock, snapState, adultered as VerifiablePresentation)).rejects.toThrowError();
      expect.assertions(1);

    });

    it.skip('should throw exception if user refused confirmation', async () => {

         // Setup
      walletMock.rpcMocks.snap_confirm.mockReturnValue(true);

      // create VC 
      let vcCreatedResult = await createVC(walletMock, snapState, { vcValue: {'prop':10} });
      //let vc = await getVCs(walletMock, snapState, {filter: {type: 'id', filter: vcCreatedResult[0].id}})

      // create VP 
      let verifiablePresentation = await createVP(walletMock, snapState, {vcs: [vcCreatedResult[0].id as string]});

      walletMock.rpcMocks.snap_confirm.mockReturnValue(false);
      await expect(verifyVP(walletMock, snapState, verifiablePresentation as VerifiablePresentation)).rejects.toThrowError();
      expect.assertions(1);

    });


  
});