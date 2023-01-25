import * as React from 'react';
import { useContext, useState } from 'react';
import axios from 'axios';
// import * as dotenv from 'dotenv';

import {
  Card,
  ConnectButton,
  InstallFlaskButton,
  ReconnectButton,
  SendHelloButton,
} from '../components';

// dotenv.config();

function LoginPage() {
  const [loginName, setLoginName] = useState('Kiran Pachhai');
  const [identifier, setIdentifier] = useState(
    'did:pkh:hedera:testnet:0.0.5373',
  );
  const [ret, setRet] = useState('undefined');

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
    </>
  );
}

export default LoginPage;
