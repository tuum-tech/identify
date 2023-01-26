import axios from 'axios';
import { useState } from 'react';
// import * as dotenv from 'dotenv';

import {
  Card, SendHelloButton
} from '../components';

// dotenv.config();

function LoginPage() {
  const [loginName, setLoginName] = useState('dchagastelles');
  const [identifier, setIdentifier] = useState(
    'did:pkh:hedera:testnet:0.0.5373',
  );
  
  const [presentation, setPresentation] = useState('');

  const [ret, setRet] = useState('');

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

    setRet(JSON.stringify(ret));
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

    setRet(JSON.stringify(ret));
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
      <p>{ret}</p>
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
                  value={presentation}
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
