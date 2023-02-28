import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import {
  connectHederaAccount,
  connectSnap,
  createVP,
  getCurrentNetwork,
  getDID,
  getSnap,
  getVCs,
  saveVC,
} from './../utils/snap';

import { ProofInfo } from '@tuum-tech/identity-snap/src/types/params';
import { IDataManagerQueryResult } from '@tuum-tech/identity-snap/src/veramo/plugins/verfiable-creds-manager';
import { VerifiableCredential, VerifiablePresentation } from '@veramo/core';
import { Button, Modal } from 'react-bootstrap';
import {
  Card,
  ConnectButton,
  InstallFlaskButton,
  ReconnectButton,
  SendHelloButton,
} from '../components';
import {
  CardContainer,
  Container,
  ErrorMessage,
  Heading,
  Span,
  Subtitle,
} from '../config/styles';
import { MetamaskActions, MetaMaskContext } from '../contexts/MetamaskContext';
import { shouldDisplayReconnectButton } from '../utils';
import { validHederaChainID } from '../utils/hedera';

function LoginPage() {
  const [state, dispatch] = useContext(MetaMaskContext);
  const [hederaAccountConnected, setHederaAccountConnected] = useState(false);
  const [hederaPrivateKey, setHederaPrivateKey] = useState(
    '2386d1d21644dc65d4e4b9e2242c5f155cab174916cbc46ad85622cdaeac835c',
  );
  const [hederaAccountId, setHederaAccountId] = useState('0.0.15215');

  const [loginName, setLoginName] = useState('exampleUsername');

  // TODO: get did by calling getDid
  const [identifier, setIdentifier] = useState(''); //useState('did:pkh:eip155:296:0x7d871f006d97498ea338268a956af94ab2e65cdd');
  const [currentChainId, setCurrentChainId] = useState('');
  const [presentation, setPresentation] = useState<
    VerifiablePresentation | undefined
  >(undefined);

  const [challenge, setChallenge] = useState('');
  const [vc, setVC] = useState('');
  const [vcId, setVcId] = useState('');
  const [vcList, setVcList] = useState([] as any);
  const [showVcsModal, setShowVcsModal] = useState(false);

  useEffect(() => {
    (async () => {
      await handleSaveVC();
    })();
  }, [vc]);

  useEffect(() => {
    (async () => {
      await handleSignIn();
    })();
  }, [challenge]);

  useEffect(() => {
    (async () => {
      if (presentation !== undefined) {
        const backend_url = process.env.GATSBY_BACKEND_URL;
        const ret = await axios({
          method: 'post',
          url: `${backend_url}api/v1/credential/signin`,
          data: {
            presentation,
          },
        });
        alert('Verified: ' + JSON.stringify(ret.data));
      }
    })();
  }, [presentation]);

  useEffect(() => {
    (async () => {
      if (identifier !== '') {
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
        if (ret.status === 200) {
          alert('Register user successful');
        }
      }
    })();
  }, [identifier]);

  useEffect(() => {
    if (!validHederaChainID(currentChainId)) {
      setHederaAccountConnected(false);
    }
  }, [currentChainId]);

  const handleConnectClick = async () => {
    try {
      await connectSnap();
      setCurrentChainId(await getCurrentNetwork());
      const installedSnap = await getSnap();

      dispatch({
        type: MetamaskActions.SetInstalled,
        payload: installedSnap,
      });
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  const handleConfigureHederaAccountClick = async () => {
    try {
      const configured = await connectHederaAccount(
        hederaPrivateKey,
        hederaAccountId,
      );
      console.log('configured: ', configured);
      if (configured) {
        setHederaAccountConnected(true);
        alert('Hedera Account configuration was successful');
      } else {
        console.log('Hedera Account was not configured correctly');
      }
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  const handleCreateVC = async () => {
    // Get the current did

    setIdentifier((await getDID()) as string);
  };

  const handleSaveVC = async () => {
    // Send a POST request
    if (vc !== '') {
      let parsedVC: VerifiableCredential = JSON.parse(
        vc,
      ) as VerifiableCredential;
      await saveVC(parsedVC);
    }
  };

  const handleVCClicked = async (vcId: string) => {
    try {
      setCurrentChainId(await getCurrentNetwork());
      const proofInfo: ProofInfo = {
        proofFormat: 'jwt',
        type: 'ProfileNamesPresentation',
        challenge,
      };
      console.log('vcId: ', vcId);
      const vp = (await createVP([vcId], proofInfo)) as VerifiablePresentation;
      setPresentation(vp);
      console.log(`Your VP is: ${JSON.stringify(vp, null, 4)}`);
      setShowVcsModal(false);
    } catch (e) {
      console.error(e);
      // dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  const handleChallenge = async () => {
    try {
      setCurrentChainId(await getCurrentNetwork());
      let identifier = (await getDID()) as string;
      const backend_url = process.env.GATSBY_BACKEND_URL;
      const ret = await axios({
        method: 'post',
        url: `${backend_url}api/v1/credential/challenge`,
        data: {
          did: identifier,
        },
      });

      if (ret.status === 200) {
        setChallenge(ret.data.challenge);
        alert('challenge ' + ret.data.challenge);
      }
    } catch (e) {}
  };

  const handleSignIn = async () => {
    try {
      setCurrentChainId(await getCurrentNetwork());
      const options = {
        store: 'snap',
        returnStore: true,
      };
      const vcs = (await getVCs(
        {
          type: 'vcType',
          filter: 'SiteLoginCredential',
        },
        options,
      )) as IDataManagerQueryResult[];

      console.log(`Your VCs are: ${JSON.stringify(vcs, null, 4)}`);
      if (vcs.length > 0) {
        setVcList(vcs);
        setShowVcsModal(true);
      } else {
        alert('no Vcs found');
      }
    } catch (e) {
      console.error(e);
      // dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  return (
    <Container>
      <Heading>
        Welcome to <Span>Identity Snap</Span>
      </Heading>
      <Subtitle>
        Check out how Signup and Login actions can be handled by utilizing VCs
        through the use of Identity Snap
      </Subtitle>
      <Modal show={showVcsModal} onHide={() => setShowVcsModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Choose the credential to Sign in with</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {vcList.map((cred: any) => (
            <div key={cred.metadata.id}>
              <span
                onClick={() => handleVCClicked(cred.metadata.id)}
              >{`Login : ${cred.data.credentialSubject.loginName} Issuance: ${cred.data.issuanceDate}`}</span>
            </div>
          ))}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => setShowVcsModal(false)}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>

      <CardContainer>
        {state.error && (
          <ErrorMessage>
            <b>An error happened:</b> {state.error.message}
          </ErrorMessage>
        )}
        {!state.isFlask && (
          <Card
            content={{
              title: 'Install',
              description:
                'Snaps is pre-release software only available in MetaMask Flask, a canary distribution for developers with access to upcoming features.',
              button: <InstallFlaskButton />,
            }}
            fullWidth
          />
        )}
        {!state.installedSnap && (
          <Card
            content={{
              title: 'Connect to Metamask Snap',
              description:
                'Get started by connecting to and installing the Identity Snap.',
              button: (
                <ConnectButton
                  onClick={handleConnectClick}
                  disabled={!state.isFlask}
                />
              ),
            }}
            disabled={!state.isFlask}
          />
        )}
        {shouldDisplayReconnectButton(state.installedSnap) && (
          <Card
            content={{
              title: 'Reconnect to Metamask Snap',
              description:
                "While connected to a local running snap, this button will always be displayed in order to update the snap if a change is made. Note that you'll need to reconnect if you switch the network on Metamask at any point in time as that will cause your metamask state to change",
              button: (
                <ReconnectButton
                  onClick={handleConnectClick}
                  disabled={!state.installedSnap}
                />
              ),
            }}
            disabled={!state.installedSnap}
          />
        )}
        {validHederaChainID(currentChainId) && !hederaAccountConnected && (
          <Card
            content={{
              title: 'connectHederaAccount',
              description:
                'Connect to Hedera Account. NOTE that you will need to reconnect to Hedera Account if you switch the network on Metamask at any point in time as that will cause your metamask state to point to your non-hedera account on metamask',
              form: (
                <form>
                  <label>
                    Enter your Hedera Private Key
                    <input
                      type="text"
                      value={hederaPrivateKey}
                      onChange={(e) => setHederaPrivateKey(e.target.value)}
                    />
                  </label>
                  <br />
                  <label>
                    Enter your Hedera Account ID
                    <input
                      type="text"
                      value={hederaAccountId}
                      onChange={(e) => setHederaAccountId(e.target.value)}
                    />
                  </label>
                </form>
              ),
              button: (
                <SendHelloButton
                  buttonText="Connect to Hedera Account"
                  onClick={handleConfigureHederaAccountClick}
                  disabled={!state.installedSnap}
                />
              ),
            }}
            disabled={!state.installedSnap}
            fullWidth={
              state.isFlask &&
              Boolean(state.installedSnap) &&
              !shouldDisplayReconnectButton(state.installedSnap)
            }
          />
        )}

        {(validHederaChainID(currentChainId) && hederaAccountConnected) ||
        (!validHederaChainID(currentChainId) && !hederaAccountConnected) ? (
          <Card
            content={{
              title: 'Sign Up',
              description:
                'This will create a Login Verifiable Credential which you can use later to login',
              form: (
                <form>
                  <label>
                    Enter your username
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
            disabled={!state.installedSnap}
            fullWidth={
              state.isFlask &&
              Boolean(state.installedSnap) &&
              !shouldDisplayReconnectButton(state.installedSnap)
            }
          />
        ) : (
          ''
        )}

        {(validHederaChainID(currentChainId) && hederaAccountConnected) ||
        (!validHederaChainID(currentChainId) && !hederaAccountConnected) ? (
          <Card
            content={{
              title: 'Sign In',
              description: 'Present VerifiableCredential so we could verify',
              button: (
                <SendHelloButton
                  buttonText="SignIn"
                  onClick={handleChallenge}
                  disabled={false}
                />
              ),
            }}
            disabled={!state.installedSnap}
            fullWidth={
              state.isFlask &&
              Boolean(state.installedSnap) &&
              !shouldDisplayReconnectButton(state.installedSnap)
            }
          />
        ) : (
          ''
        )}
      </CardContainer>
    </Container>
  );
}

export default LoginPage;
