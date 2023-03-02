import { useContext, useEffect, useState } from 'react';

import { Card, InstallFlaskButton } from '../components';
import {
  CardContainer,
  Container,
  ErrorMessage,
  Heading,
  Span,
  Subtitle,
} from '../config/styles';
import { MetamaskActions, MetaMaskContext } from '../contexts/MetamaskContext';
import { connectSnap, getCurrentNetwork, getSnap } from '../utils';
import { validHederaChainID } from '../utils/hedera';
import ConfigureGoogleAccount from './cards/ConfigureGoogleAccount';
import ConnectHederaAccount from './cards/ConnectHederaAccount';
import ConnectIdentitySnap from './cards/ConnectIdentitySnap';
import CreateVC from './cards/CreateVC';
import DeleteAllVCs from './cards/DeleteAllVCs';
import GetAllVCs from './cards/GetAllVCs';
import GetCurrentDIDMethod from './cards/GetCurrentDIDMethod';
import GetDID from './cards/GetDID';
import GetHederaAccountId from './cards/GetHederaAccountId';
import GetSpecificVC from './cards/GetSpecificVC';
import GetVP from './cards/GetVP';
import ReconnectIdentitySnap from './cards/ReconnectIdentitySnap';
import RemoveVC from './cards/RemoveVC';
import ResolveDID from './cards/ResolveDID';
import SendHelloHessage from './cards/SendHelloHessage';
import SyncGoogleVCs from './cards/SyncGoogleVCs';
import Todo from './cards/Todo';
import ToggleMetamaskPopups from './cards/ToggleMetamaskPopups';
import VerifyVC from './cards/VerifyVC';
import VerifyVP from './cards/VerifyVP';

const Index = () => {
  const [state, dispatch] = useContext(MetaMaskContext);
  const [currentChainId, setCurrentChainId] = useState('');
  const [hederaAccountConnected, setHederaAccountConnected] = useState(false);

  const isNonHedera =
    (validHederaChainID(currentChainId) && hederaAccountConnected) ||
    (!validHederaChainID(currentChainId) && !hederaAccountConnected);

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
        <ConnectIdentitySnap handleConnectClick={handleConnectClick} />
        <ReconnectIdentitySnap handleConnectClick={handleConnectClick} />
        <ConnectHederaAccount
          currentChainId={currentChainId}
          hederaAccountConnected={hederaAccountConnected}
          setHederaAccountConnected={setHederaAccountConnected}
        />
        <GetHederaAccountId
          currentChainId={currentChainId}
          setCurrentChainId={setCurrentChainId}
          hederaAccountConnected={hederaAccountConnected}
        />
        {isNonHedera && (
          <>
            <SendHelloHessage setCurrentChainId={setCurrentChainId} />
            <ToggleMetamaskPopups setCurrentChainId={setCurrentChainId} />
            <GetCurrentDIDMethod setCurrentChainId={setCurrentChainId} />
            <GetDID setCurrentChainId={setCurrentChainId} />
            <ResolveDID setCurrentChainId={setCurrentChainId} />
            <GetSpecificVC setCurrentChainId={setCurrentChainId} />
            <GetAllVCs setCurrentChainId={setCurrentChainId} />
            <CreateVC setCurrentChainId={setCurrentChainId} />
            <VerifyVC setCurrentChainId={setCurrentChainId} />
            <RemoveVC setCurrentChainId={setCurrentChainId} />
            <DeleteAllVCs setCurrentChainId={setCurrentChainId} />
            <GetVP setCurrentChainId={setCurrentChainId} />
            <VerifyVP setCurrentChainId={setCurrentChainId} />
            <ConfigureGoogleAccount />
            <SyncGoogleVCs />
            <Todo />
            <Todo />
            <Todo />
          </>
        )}
      </CardContainer>
    </Container>
  );
};

export default Index;
