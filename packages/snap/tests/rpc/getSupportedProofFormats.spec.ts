import { getSupportedProofFormats } from '../../src/rpc/vc/getSupportedProofFormats';


jest.mock('uuid');

  describe('GetSupportedProofFormats', () => {
    

    it('should return all supported proof formats', async () => {

      // get  
      let getAvailableMethodsResult = await getSupportedProofFormats();
      expect(getAvailableMethodsResult.length).toBe(3);
      expect(getAvailableMethodsResult).toContain('jwt');
      expect(getAvailableMethodsResult).toContain('lds');
      expect(getAvailableMethodsResult).toContain('EthereumEip712Signature2021');
      
      expect.assertions(4);
    
    });



});