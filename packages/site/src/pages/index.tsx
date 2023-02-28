import { useGoogleLogin } from '@react-oauth/google';
import { ProofInfo } from '@tuum-tech/identity-snap/src/types/params';
import { IDataManagerClearResult } from '@tuum-tech/identity-snap/src/veramo/plugins/verfiable-creds-manager';
import { VerifiablePresentation } from '@veramo/core';
import { useContext, useEffect, useState } from 'react';

import {
  Card,
  ConnectButton,
  InstallFlaskButton,
  ReconnectButton,
  SendHelloButton,
  TextInput,
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
import { VcContext } from '../contexts/VcContext';
import {
  configureGoogleAccount,
  connectHederaAccount,
  connectSnap,
  createVP,
  deleteAllVCs,
  getCurrentNetwork,
  getHederaAccountId,
  getSnap,
  sendHello,
  shouldDisplayReconnectButton,
  syncGoogleVCs,
  togglePopups,
  verifyVP,
} from '../utils';
import { validHederaChainID } from '../utils/hedera';
import CreateVC from './cards/CreateVC';
import GetAllVCs from './cards/GetAllVCs';
import GetCurrentDIDMethod from './cards/GetCurrentDIDMethod';
import GetDID from './cards/GetDID';
import GetSpecificVC from './cards/GetSpecificVC';
import RemoveVC from './cards/RemoveVC';
import ResolveDID from './cards/ResolveDID';
import VerifyVC from './cards/VerifyVC';

const Index = () => {
  const [state, dispatch] = useContext(MetaMaskContext);
  const [currentChainId, setCurrentChainId] = useState('');
  const [hederaAccountConnected, setHederaAccountConnected] = useState(false);

  const [hederaAccountId, setHederaAccountId] = useState('0.0.15215');

  const { vcId, setVcId, vc, setVc, vcIdsToBeRemoved, setVcIdsToBeRemoved } =
    useContext(VcContext);
  const [vp, setVp] = useState({});
  const [loadingState, setLoadingState] = useState<string | null>(null);

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

  const handleConfigureGoogleAccount = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoadingState('configureGoogleAccount');
      await configureGoogleAccount(tokenResponse.access_token);
      alert('Google Account configuration was successful');
      setLoadingState(null);
    },
    onError: (error) => {
      console.log('Login Failed', error);
    },
  });

  const handleSyncGoogleVCs = async () => {
    setLoadingState('syncGoogleVCs');
    try {
      const resp = await syncGoogleVCs();
      console.log('Synced with google drive: ', resp);
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
    setLoadingState(null);
  };

  const handleConfigureHederaAccountClick = async () => {
    setLoadingState('connectHederaAccount');
    try {
      const configured = await connectHederaAccount(hederaAccountId);
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
    setLoadingState(null);
  };

  const handleSendHelloClick = async () => {
    try {
      setCurrentChainId(await getCurrentNetwork());
      await sendHello();
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  const handleTogglePopupsClick = async () => {
    try {
      setCurrentChainId(await getCurrentNetwork());
      await togglePopups();
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  const handleDeleteAllVCsClick = async () => {
    try {
      setCurrentChainId(await getCurrentNetwork());
      const options = {
        // If you want to remove the VCs from multiple stores, you can pass an array like so:
        // store: ['snap', 'googleDrive'],
        store: 'snap',
      };
      const isRemoved = (await deleteAllVCs(
        options,
      )) as IDataManagerClearResult[];
      console.log(`Remove VC Result: ${JSON.stringify(isRemoved, null, 4)}`);
      setVcId('');
      setVcIdsToBeRemoved('');
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
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
        proofInfo,
      )) as VerifiablePresentation;
      setVp(vp);
      console.log(`Your VP is: ${JSON.stringify(vp, null, 4)}`);
      alert(`Your VP is: ${JSON.stringify(vp, null, 4)}`);
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  const handleVerifyVPClick = async () => {
    try {
      setCurrentChainId(await getCurrentNetwork());
      const verified = await verifyVP(vp);
      console.log('VP Verified: ', verified);
      alert(`VP Verified: ${verified}`);
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  const handleGetHederaAccountIdClick = async () => {
    try {
      setCurrentChainId(await getCurrentNetwork());
      const accountId = await getHederaAccountId();
      console.log(`Your Hedera Account Id is: ${accountId}`);
      alert(`Your Hedera Account Id is: ${accountId}`);
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  return (
    <Container>
      <Heading>
        Welcome to <Span>Identity Snap</Span>
      </Heading>
      <Subtitle>
        Get started by editing <code>src/index.ts</code>
      </Subtitle>
      {state.error && (
        <ErrorMessage>
          <b>An error happened:</b> {state.error.message}
        </ErrorMessage>
      )}
      <CardContainer>
        {!state.isFlask && (
          <Card
            content={{
              title: 'Install Metamask Flask',
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
              title: 'Connect to Identity Snap',
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
              title: 'Reconnect to Identity Snap',
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
        {/* =============================================================================== */}
        {validHederaChainID(currentChainId) && !hederaAccountConnected && (
          <Card
            content={{
              title: 'connectHederaAccount',
              description:
                'Connect to Hedera Account. NOTE that you will need to reconnect to Hedera Account if you switch the network on Metamask at any point in time as that will cause your metamask state to point to your non-hedera account on metamask',
              form: (
                <form>
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
                  loading={loadingState === 'connectHederaAccount'}
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
        {/* =============================================================================== */}
        {(validHederaChainID(currentChainId) && hederaAccountConnected) ||
        (!validHederaChainID(currentChainId) && !hederaAccountConnected) ? (
          <Card
            content={{
              title: 'Send Hello message',
              description:
                'Display a custom message within a confirmation screen in MetaMask.',
              button: (
                <SendHelloButton
                  buttonText="Send message"
                  onClick={handleSendHelloClick}
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
        ) : (
          ''
        )}
        {/* =============================================================================== */}
        {(validHederaChainID(currentChainId) && hederaAccountConnected) ||
        (!validHederaChainID(currentChainId) && !hederaAccountConnected) ? (
          <Card
            content={{
              title: 'Toggle Metamask popups',
              description:
                'You can enable/disable the popups at anytime by calling this API',
              button: (
                <SendHelloButton
                  buttonText="Toggle"
                  onClick={handleTogglePopupsClick}
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
        ) : (
          ''
        )}
        {/* =============================================================================== */}
        <GetCurrentDIDMethod
          currentChainId={currentChainId}
          setCurrentChainId={setCurrentChainId}
          hederaAccountConnected={hederaAccountConnected}
        />
        {/* =============================================================================== */}
        <GetDID
          currentChainId={currentChainId}
          setCurrentChainId={setCurrentChainId}
          hederaAccountConnected={hederaAccountConnected}
        />

        {/* =============================================================================== */}
        <ResolveDID
          currentChainId={currentChainId}
          setCurrentChainId={setCurrentChainId}
          hederaAccountConnected={hederaAccountConnected}
        />
        {/* =============================================================================== */}
        <GetSpecificVC
          currentChainId={currentChainId}
          setCurrentChainId={setCurrentChainId}
          hederaAccountConnected={hederaAccountConnected}
        />
        {/* =============================================================================== */}
        <GetAllVCs
          currentChainId={currentChainId}
          setCurrentChainId={setCurrentChainId}
          hederaAccountConnected={hederaAccountConnected}
        />

        {/* =============================================================================== */}
        <CreateVC
          currentChainId={currentChainId}
          setCurrentChainId={setCurrentChainId}
          hederaAccountConnected={hederaAccountConnected}
        />
        {/* =============================================================================== */}
        <VerifyVC
          currentChainId={currentChainId}
          setCurrentChainId={setCurrentChainId}
          hederaAccountConnected={hederaAccountConnected}
        />
        {/* =============================================================================== */}
        <RemoveVC
          currentChainId={currentChainId}
          setCurrentChainId={setCurrentChainId}
          hederaAccountConnected={hederaAccountConnected}
        />
        {/* =============================================================================== */}
        {(validHederaChainID(currentChainId) && hederaAccountConnected) ||
        (!validHederaChainID(currentChainId) && !hederaAccountConnected) ? (
          <Card
            content={{
              title: 'deleteAllVCs',
              description: 'Delete all the VCs from the snap',
              button: (
                <SendHelloButton
                  buttonText="Delete all VCs"
                  onClick={handleDeleteAllVCsClick}
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
        ) : (
          ''
        )}
        {/* =============================================================================== */}
        {(validHederaChainID(currentChainId) && hederaAccountConnected) ||
        (!validHederaChainID(currentChainId) && !hederaAccountConnected) ? (
          <Card
            content={{
              title: 'getVP',
              description: 'Generate Verifiable Presentation from your VC',
              form: (
                <form>
                  <label>
                    Enter the Verifiable Credential ID
                    <TextInput
                      rows={2}
                      value={vcId}
                      onChange={(e) => setVcId(e.target.value)}
                      fullWidth
                    />
                  </label>
                </form>
              ),
              button: (
                <SendHelloButton
                  buttonText="Generate VP"
                  onClick={handleCreateVPClick}
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
        ) : (
          ''
        )}
        {/* =============================================================================== */}
        {(validHederaChainID(currentChainId) && hederaAccountConnected) ||
        (!validHederaChainID(currentChainId) && !hederaAccountConnected) ? (
          <Card
            content={{
              title: 'verifyVP',
              description: 'Verify a VP JWT or LDS format',
              form: (
                <form>
                  <label>
                    Enter your Verifiable Presentation
                    <TextInput
                      rows={2}
                      value={JSON.stringify(vp)}
                      onChange={(e) => setVp(e.target.value)}
                      fullWidth
                    />
                  </label>
                </form>
              ),
              button: (
                <SendHelloButton
                  buttonText="Verify VP"
                  onClick={handleVerifyVPClick}
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
        ) : (
          ''
        )}
        {/* =============================================================================== */}
        {validHederaChainID(currentChainId) && hederaAccountConnected ? (
          <Card
            content={{
              title: 'getHederaAccountId',
              description: 'Retrieve Hedera Account Id',
              button: (
                <SendHelloButton
                  buttonText="Get Account Id"
                  onClick={handleGetHederaAccountIdClick}
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
        ) : (
          ''
        )}
        {/* =============================================================================== */}
        {(validHederaChainID(currentChainId) && hederaAccountConnected) ||
        (!validHederaChainID(currentChainId) && !hederaAccountConnected) ? (
          <Card
            content={{
              title: 'configureGoogleAccount',
              description: 'Configure Google Account',
              form: null,
              button: (
                <SendHelloButton
                  buttonText="Configure Google Account"
                  onClick={handleConfigureGoogleAccount}
                  disabled={!state.installedSnap}
                  loading={loadingState === 'configureGoogleAccount'}
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
        {/* =============================================================================== */}
        {(validHederaChainID(currentChainId) && hederaAccountConnected) ||
        (!validHederaChainID(currentChainId) && !hederaAccountConnected) ? (
          <Card
            content={{
              title: 'syncGoogleVCs',
              description: 'Sync VCs with google drive',
              button: (
                <SendHelloButton
                  buttonText="Sync Google VCs"
                  onClick={handleSyncGoogleVCs}
                  disabled={!state.installedSnap}
                  loading={loadingState === 'syncGoogleVCs'}
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
        {/* =============================================================================== */}
        {(validHederaChainID(currentChainId) && hederaAccountConnected) ||
        (!validHederaChainID(currentChainId) && !hederaAccountConnected) ? (
          <Card
            content={{
              title: 'todo',
              description: 'TODO',
              /* form: (
              <form>
                <label>
                  Enter your Verifiable Presentation
                  <input
                    type="text"
                    value={JSON.stringify(vp)}
                    onChange={(e) => setVp(e.target.value)}
                  />
                </label>
              </form>
            ), */
              button: (
                <SendHelloButton
                  buttonText="todo"
                  onClick={handleVerifyVPClick}
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
        ) : (
          ''
        )}
        {/* =============================================================================== */}
        {(validHederaChainID(currentChainId) && hederaAccountConnected) ||
        (!validHederaChainID(currentChainId) && !hederaAccountConnected) ? (
          <Card
            content={{
              title: 'todo',
              description: 'TODO',
              /* form: (
              <form>
                <label>
                  Enter your Verifiable Presentation
                  <input
                    type="text"
                    value={JSON.stringify(vp)}
                    onChange={(e) => setVp(e.target.value)}
                  />
                </label>
              </form>
            ), */
              button: (
                <SendHelloButton
                  buttonText="todo"
                  onClick={handleVerifyVPClick}
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
        ) : (
          ''
        )}
        {/* =============================================================================== */}
        {(validHederaChainID(currentChainId) && hederaAccountConnected) ||
        (!validHederaChainID(currentChainId) && !hederaAccountConnected) ? (
          <Card
            content={{
              title: 'todo',
              description: 'TODO',
              /* form: (
              <form>
                <label>
                  Enter your Verifiable Presentation
                  <input
                    type="text"
                    value={JSON.stringify(vp)}
                    onChange={(e) => setVp(e.target.value)}
                  />
                </label>
              </form>
            ), */
              button: (
                <SendHelloButton
                  buttonText="todo"
                  onClick={handleVerifyVPClick}
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
        ) : (
          ''
        )}
      </CardContainer>
    </Container>
  );
};

export default Index;
