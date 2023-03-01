import { useGoogleLogin } from '@react-oauth/google';
import { useContext, useEffect, useState } from 'react';

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
import { VcContext } from '../contexts/VcContext';
import {
  configureGoogleAccount,
  connectHederaAccount,
  connectSnap,
  getCurrentNetwork,
  getHederaAccountId,
  getSnap,
  sendHello,
  shouldDisplayReconnectButton,
  syncGoogleVCs,
  togglePopups,
} from '../utils';
import { validHederaChainID } from '../utils/hedera';
import CreateVC from './cards/CreateVC';
import DeleteAllVCs from './cards/DeleteAllVCs';
import GetAllVCs from './cards/GetAllVCs';
import GetCurrentDIDMethod from './cards/GetCurrentDIDMethod';
import GetDID from './cards/GetDID';
import GetSpecificVC from './cards/GetSpecificVC';
import GetVP from './cards/GetVP';
import RemoveVC from './cards/RemoveVC';
import ResolveDID from './cards/ResolveDID';
import Todo from './cards/Todo';
import VerifyVC from './cards/VerifyVC';
import VerifyVP from './cards/VerifyVP';

const Index = () => {
  const [state, dispatch] = useContext(MetaMaskContext);
  const [currentChainId, setCurrentChainId] = useState('');
  const [hederaAccountConnected, setHederaAccountConnected] = useState(false);

  const [hederaAccountId, setHederaAccountId] = useState('0.0.15215');

  const {
    vcId,
    setVcId,
    vc,
    setVc,
    vcIdsToBeRemoved,
    setVcIdsToBeRemoved,
    vp,
    setVp,
  } = useContext(VcContext);
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
        <GetCurrentDIDMethod
          currentChainId={currentChainId}
          setCurrentChainId={setCurrentChainId}
          hederaAccountConnected={hederaAccountConnected}
        />
        <GetDID
          currentChainId={currentChainId}
          setCurrentChainId={setCurrentChainId}
          hederaAccountConnected={hederaAccountConnected}
        />
        <ResolveDID
          currentChainId={currentChainId}
          setCurrentChainId={setCurrentChainId}
          hederaAccountConnected={hederaAccountConnected}
        />
        <GetSpecificVC
          currentChainId={currentChainId}
          setCurrentChainId={setCurrentChainId}
          hederaAccountConnected={hederaAccountConnected}
        />
        <GetAllVCs
          currentChainId={currentChainId}
          setCurrentChainId={setCurrentChainId}
          hederaAccountConnected={hederaAccountConnected}
        />
        <CreateVC
          currentChainId={currentChainId}
          setCurrentChainId={setCurrentChainId}
          hederaAccountConnected={hederaAccountConnected}
        />
        <VerifyVC
          currentChainId={currentChainId}
          setCurrentChainId={setCurrentChainId}
          hederaAccountConnected={hederaAccountConnected}
        />
        <RemoveVC
          currentChainId={currentChainId}
          setCurrentChainId={setCurrentChainId}
          hederaAccountConnected={hederaAccountConnected}
        />
        <DeleteAllVCs
          currentChainId={currentChainId}
          setCurrentChainId={setCurrentChainId}
          hederaAccountConnected={hederaAccountConnected}
        />
        <GetVP
          currentChainId={currentChainId}
          setCurrentChainId={setCurrentChainId}
          hederaAccountConnected={hederaAccountConnected}
        />
        <VerifyVP
          currentChainId={currentChainId}
          setCurrentChainId={setCurrentChainId}
          hederaAccountConnected={hederaAccountConnected}
        />
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
        <Todo
          currentChainId={currentChainId}
          hederaAccountConnected={hederaAccountConnected}
        />
        {/* =============================================================================== */}
        <Todo
          currentChainId={currentChainId}
          hederaAccountConnected={hederaAccountConnected}
        />
        {/* =============================================================================== */}
        <Todo
          currentChainId={currentChainId}
          hederaAccountConnected={hederaAccountConnected}
        />
      </CardContainer>
    </Container>
  );
};

export default Index;
