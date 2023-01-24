import * as React from 'react';
import { useContext, useState } from 'react';
import {
  Card,
  ConnectButton,
  InstallFlaskButton,
  ReconnectButton,
  SendHelloButton,
} from '../components';

function LoginPage() {
  const [createLoginName, setCreateLoginName] = useState('Kiran Pachhai');
  const [createDid, setCreateDid] = useState('KP Woods');

  const handleCreateVC = () => {
    // call
  };

  return (
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
                value={createLoginName}
                onChange={(e) => setCreateLoginName(e.target.value)}
              />
            </label>
            <br />
            <label>
              Enter your did
              <input
                type="text"
                value={createDid}
                onChange={(e) => setCreateDid(e.target.value)}
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
  );
}

export default LoginPage;
