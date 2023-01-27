import axios from 'axios';
import { useEffect, useState } from 'react';
import { createVP, getCurrentNetwork, getDID, getVCs, saveVC } from './../utils/snap';

import { ProofInfo } from '@tuum-tech/identity-snap/src/types/params';
import { IDataManagerQueryResult } from '@tuum-tech/identity-snap/src/veramo/plugins/verfiable-creds-manager';
import { VerifiableCredential, VerifiablePresentation } from '@veramo/core';
import { Button, Modal } from 'react-bootstrap';
import {
  Card, SendHelloButton
} from '../components';


function LoginPage() {
  const [loginName, setLoginName] = useState('dchagastelles');

  // TODO: get did by calling getDid
  const [identifier, setIdentifier] = useState(''); //useState('did:pkh:eip155:296:0x7d871f006d97498ea338268a956af94ab2e65cdd');
  const [currentChainId, setCurrentChainId] = useState('');
  const [presentation, setPresentation] = useState<VerifiablePresentation | undefined>(undefined);

  const [vc, setVC] = useState('');
  const [vcId, setVcId] = useState('');
  const [vcList, setVcList] = useState([] as any);
  const [showVcsModal, setShowVcsModal] = useState(false);


  useEffect(()=>{
    (async () => {
      
      await handleSaveVC();

    })();
  }, [vc]);

   useEffect(()=>{
    (async () => {
      if (presentation !== undefined){

        const backend_url = process.env.GATSBY_BACKEND_URL;
        const ret = await axios({
          method: 'post',
          url: `${backend_url}api/v1/credential/signin`,
          data: {
            presentation
          },
        });
        alert("Verified: " + JSON.stringify(ret.data));
      }
    })();
  }, [presentation]);

  useEffect(()=>{
    (async () => {
      
      if (identifier !== ''){

        // Send a POST request to obtain a signed VC from the backend
        const backend_url = process.env.GATSBY_BACKEND_URL;
        const ret = await axios({
          method: 'post',
          url: `${backend_url}api/v1/credential/register`,
          data: {
            loginName,
            identifier,
          },
        });
  
        setVC(JSON.stringify(ret.data));
      }
      })();
  }, [identifier]);

  const handleCreateVC = async () => {

    // Get the current did

    setIdentifier(await getDID() as string);


  
  };


  const handleSaveVC = async () => {
    // Send a POST request
    if (vc !== ''){

      let parsedVC : VerifiableCredential = JSON.parse(vc) as VerifiableCredential;
      await saveVC(parsedVC);
      
    };
    
  };

 

  const handleVCClicked = async (vcId: string) => {
    try {
      setCurrentChainId(await getCurrentNetwork());
      const proofInfo: ProofInfo = {
        proofFormat: 'jwt',
        type: 'ProfileNamesPresentation',
      };
      console.log('vcId: ', vcId);
      const vp = (await createVP(
        [vcId],
        proofInfo
      )) as VerifiablePresentation;
      setPresentation(vp);
      console.log(`Your VP is: ${JSON.stringify(vp, null, 4)}`);
      setShowVcsModal(false);
    } catch (e) {
      console.error(e);
      //dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  } 


  const handleSignIn = async () => {
    try {
      setCurrentChainId(await getCurrentNetwork());
      const options = {
        store: 'snap',
        returnStore: true,
      };
      const vcs = (await getVCs(
        undefined,
        options
      )) as IDataManagerQueryResult[];

      console.log(`Your VCs are: ${JSON.stringify(vcs, null, 4)}`);
      if (vcs.length > 0) {
       
          setVcList(vcs);
          setShowVcsModal(true);
          
       
      } else {
        // no need to select
      }
    } catch (e) {
      console.error(e);
      //dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  return (
    <>
     <Modal show={showVcsModal} onHide={() => setShowVcsModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Choose the credential to Sign in with</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {vcList.map((cred: any) => (
            <div>
              <span onClick={() => handleVCClicked(cred.metadata.id)}>{`Login : ${cred.data.credentialSubject.loginName}  Issuance: ${cred.data.issuanceDate}`}</span>
            </div>
          ))}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => setShowVcsModal(false)}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
      <Card
        content={{
          title: 'createVC',
          description: 'Generate VerifiableCredential signed by us',
          form: (
            <form>
              <label>
                Enter your login
                <input
                  type="text"
                  value={loginName}
                  onChange={(e) => setLoginName(e.target.value)}
                />
              </label>
             
            </form>
          ),
          button: (
            <SendHelloButton
              buttonText="Generate VC"
              onClick={handleCreateVC}
              disabled={false}
            />
          ),
        }}
        disabled={false}
      />
      
            
      <Card
        content={{
          title: 'Sign In',
          description: 'Present VerifiableCredential so we could verify',
          button: (
            <SendHelloButton
              buttonText="SignIn"
              onClick={handleSignIn}
              disabled={false}
            />
          ),
        }}
        disabled={false}
      />
      
    </>
  );
}

export default LoginPage;
