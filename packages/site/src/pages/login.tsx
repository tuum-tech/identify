import axios from 'axios';
import { useState } from 'react';
import { createVP, getCurrentNetwork, getVCs, saveVC } from './../utils/snap';

import { ProofInfo } from '@tuum-tech/identity-snap/src/types/params';
import { IDataManagerQueryResult } from '@tuum-tech/identity-snap/src/veramo/plugins/verfiable-creds-manager';
import { VerifiableCredential, VerifiablePresentation } from '@veramo/core';
import {
  Card, SendHelloButton
} from '../components';

// dotenv.config();

function LoginPage() {
  const [loginName, setLoginName] = useState('dchagastelles');

  // TODO: get did by calling getDid
  const [identifier, setIdentifier] = useState(
    'did:pkh:eip155:296:0x7d871f006d97498ea338268a956af94ab2e65cdd',
  );
  const [currentChainId, setCurrentChainId] = useState('');
  const [presentation, setPresentation] = useState({});

  const [vc, setVC] = useState('');
  const [vcId, setVcId] = useState('138af73c-f22d-4c75-b578-773fc70dff28');

  const handleCreateVC = async () => {
    // Send a POST request

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
    
  };


  const handleSaveVC = async () => {
    // Send a POST request

    let parsedVC : VerifiableCredential = JSON.parse(vc) as VerifiableCredential;
    await saveVC(parsedVC);
    
  };

  const handleSignIn = async () => {
    // Send a POST request

     const backend_url = process.env.GATSBY_BACKEND_URL;
    const ret = await axios({
      method: 'post',
      url: `${backend_url}api/v1/credential/signin`,
      data: {
        presentation
      },
    });

    setVC(JSON.stringify(ret.data));
  };

  const handleCreateVPClick = async () => {
     try {
      setCurrentChainId(await getCurrentNetwork());
      const proofInfo: ProofInfo = {
        proofFormat: 'jwt',
        type: 'ProfileNamesPresentation',
      };
      console.log('vcId: ', vcId);
      const vp = (await createVP(
        vcId.trim().split(','),
        proofInfo
      )) as VerifiablePresentation;
      setPresentation(vp);
      console.log(`Your VP is: ${JSON.stringify(vp, null, 4)}`);
      alert(`Your VP is: ${JSON.stringify(vp, null, 4)}`);
    } catch (e) {
      console.error(e);
      //dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  }


  const handleGetVCsClick = async () => {
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
        const keys = vcs.map((vc: { metadata: any }) => vc.metadata.id);
        if (keys.length > 0) {
          // setVcId(keys.toString());
          // setVcIdsToBeRemoved(keys.toString());
          // setVc(vcs[keys.length - 1].data as IDataManagerQueryResult);
          alert(`Your VC IDs are: ${keys.toString()}`);
        }
      }
    } catch (e) {
      console.error(e);
      //dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  return (
    <>
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
              <br />
              <label>
                Enter your did
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
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
      <p>
        {vc} 
        <SendHelloButton
          buttonText="Save VC"
          onClick={handleSaveVC}
          disabled={false}
        />
        <SendHelloButton
          buttonText="Get VCs"
          onClick={handleGetVCsClick}
          disabled={false}
        />
        <SendHelloButton
          buttonText="Generate Presentation"
          onClick={handleCreateVPClick}
          disabled={false}
        />

      </p>
            
      <Card
        content={{
          title: 'Sign In',
          description: 'Present VerifiableCredential so we could verify',
          form: (
            <form>
              <label>
                Enter your VerifiablePresentation
                <input
                  type="text"
                  value={JSON.stringify(presentation)}
                  onChange={(e) => setPresentation(e.target.value)}
                />
              </label>
            </form>
          ),
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
