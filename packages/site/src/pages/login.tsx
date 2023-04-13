/* eslint-disable no-alert */
import { PublicAccountInfo } from '@tuum-tech/identity-snap/src/interfaces';
import { IDataManagerQueryResult } from '@tuum-tech/identity-snap/src/plugins/veramo/verifiable-creds-manager';
import {
  CreateVPRequestParams,
  ProofInfo,
} from '@tuum-tech/identity-snap/src/types/params';
import { VerifiablePresentation, W3CVerifiableCredential } from '@veramo/core';
import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { Card, InstallFlaskButton, SendHelloButton } from '../components/base';
import {
  ConnectIdentitySnap,
  ReconnectIdentitySnap,
} from '../components/cards';
import {
  CardContainer,
  ErrorMessage,
  Heading,
  PageContainer,
  Span,
  Subtitle,
} from '../config/styles';
import { MetaMaskContext, MetamaskActions } from '../contexts/MetamaskContext';
import useModal from '../hooks/useModal';
import { shouldDisplayReconnectButton } from '../utils';
import { getNetwork, validHederaChainID } from '../utils/hedera';
import {
  connectSnap,
  createVP,
  getAccountInfo,
  getCurrentNetwork,
  getSnap,
  getVCs,
  saveVC,
} from '../utils/snap';

function LoginPage() {
  const [state, dispatch] = useContext(MetaMaskContext);
  const [hederaAccountConnected, setHederaAccountConnected] = useState(false);
  const [loginName, setLoginName] = useState('exampleUsername');

  // TODO: get did by calling getDid
  const [identifier, setIdentifier] = useState(''); // useState('did:pkh:eip155:296:0x7d871f006d97498ea338268a956af94ab2e65cdd');
  const [currentChainId, setCurrentChainId] = useState('');
  const [currentNetwork, setCurrentNetwork] = useState('');

  const [presentation, setPresentation] = useState<
    VerifiablePresentation | undefined
  >(undefined);

  const [challenge, setChallenge] = useState('');
  const [vc, setVC] = useState('');
  const [vcList, setVcList] = useState([] as any);
  const [showVcsModal, setShowVcsModal] = useState(false);
  const { showModal } = useModal();

  const handleSaveVC = async () => {
    // Send a POST request
    if (vc !== '') {
      const parsedVC: W3CVerifiableCredential = JSON.parse(
        vc,
      ) as W3CVerifiableCredential;

      let params = {
        data: [parsedVC],
      };
      await saveVC(params);
    }
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

  useEffect(() => {
    (async () => {
      await handleSaveVC();
    })();
  }, [vc]);

  useEffect(() => {
    (async () => {
      if (challenge !== '') await handleSignIn();
    })();
  }, [challenge]);

  useEffect(() => {
    (async () => {
      if (presentation !== undefined) {
        const backendUrl = process.env.GATSBY_BACKEND_URL;
        const ret = await axios({
          method: 'post',
          url: `${backendUrl}api/v1/credential/signin`,
          data: {
            presentation,
          },
        });
        alert(`Verified: ${JSON.stringify(ret.data)}`);
      }
    })();
  }, [presentation]);

  useEffect(() => {
    (async () => {
      if (identifier !== '') {
        // Send a POST request to obtain a signed VC from the backend
        const backendUrl = process.env.GATSBY_BACKEND_URL;
        const ret = await axios({
          method: 'post',
          url: `${backendUrl}api/v1/credential/register`,
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
    setCurrentNetwork(getNetwork(currentChainId));
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

  const handleCreateVC = async () => {
    // Get the current did

    setIdentifier((await getDID()) as string);
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

      let createVpRequestParameters: CreateVPRequestParams = {
        vcIds: [vcId],
        vcs: [],
        proofInfo,
      };
      const vp = (await createVP(
        createVpRequestParameters,
      )) as VerifiablePresentation;
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
      const accountInfo: PublicAccountInfo = (await getAccountInfo(
        undefined,
      )) as PublicAccountInfo;
      const backendUrl = process.env.GATSBY_BACKEND_URL;
      const ret = await axios({
        method: 'post',
        url: `${backendUrl}api/v1/credential/challenge`,
        data: {
          did: accountInfo.did,
        },
      });

      if (ret.status === 200) {
        setChallenge(ret.data.challenge);
        showModal({
          title: 'Sign in',
          content: `challenge ${ret.data.challenge}`,
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <PageContainer>
      <Heading>
        Welcome to <Span>Identity Snap</Span>
      </Heading>
      <Subtitle>
        Check out how Signup and Login actions can be handled by utilizing VCs
        through the use of Identity Snap
      </Subtitle>
      <dl>
        <dt style={{ float: 'left' }}>Current Network:</dt>
        <dd style={{ paddingLeft: 10 }}>{currentNetwork}</dd>
      </dl>
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

      {state.error && (
        <ErrorMessage>
          <b>An error happened:</b> {state.error.message}
        </ErrorMessage>
      )}
      <CardContainer>
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
        <ConnectIdentitySnap handleConnectClick={handleConnectClick} />
        <ReconnectIdentitySnap handleConnectClick={handleConnectClick} />
        <>
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
        </>
      </CardContainer>
    </PageContainer>
  );
}

export default LoginPage;
