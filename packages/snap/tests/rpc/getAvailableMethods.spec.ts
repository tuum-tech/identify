import { getAvailableMethods } from '../../src/rpc/did/getAvailableMethods';


jest.mock('uuid');

  describe.skip('GetAvailableMethods', () => {
    

    it('should return all available methods', async () => {

      // get  
      let getAvailableMethodsResult = await getAvailableMethods();
      expect(getAvailableMethodsResult.length).toBeGreaterThanOrEqual(1);
    
      expect.assertions(1);
    });


    it('should contains did:pkh in available methods', async () => {

      // get  
      let getAvailableMethodsResult = await getAvailableMethods();
      expect(getAvailableMethodsResult).toContain("did:pkh");
    
      expect.assertions(1);
    });




});