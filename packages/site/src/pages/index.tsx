import { useContext, useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

import { Card, ConnectButton, InstallFlaskButton } from '../components/base';
import {
  ConfigureGoogleAccount,
  ConnectHederaAccount,
  ConnectIdentitySnap,
  CreateVC,
  DeleteAllVCs,
  GetAccountInfo,
  GetAllVCs,
  GetCurrentDIDMethod,
  GetDID,
  GetHederaAccountId,
  GetSpecificVC,
  GetVP,
  ReconnectIdentitySnap,
  RemoveVC,
  ResolveDID,
  SendHelloHessage,
  SyncGoogleVCs,
  Todo,
  ToggleMetamaskPopups,
  VerifyVC,
  VerifyVP,
} from '../components/cards';
import {
  CardContainer,
  ErrorMessage,
  Heading,
  PageContainer,
  Span,
} from '../config/styles';
import { MetamaskActions, MetaMaskContext } from '../contexts/MetamaskContext';
import { connectSnap, getCurrentNetwork, getSnap } from '../utils';
import { getNetwork, validHederaChainID } from '../utils/hedera';

const Index = () => {
  const [state, dispatch] = useContext(MetaMaskContext);
  const [currentChainId, setCurrentChainId] = useState('');
  const [hederaAccountConnected, setHederaAccountConnected] = useState(false);
  const [currentNetwork, setCurrentNetwork] = useState('');
  const [accountInfo, setAccountInfo] = useState<unknown>(null);

  const isHedera = validHederaChainID(currentChainId) && hederaAccountConnected;
  const noHedera =
    !validHederaChainID(currentChainId) && !hederaAccountConnected;
  const isNonHedera = isHedera || noHedera;
  const requireHedera =
    validHederaChainID(currentChainId) && !hederaAccountConnected;

  useEffect(() => {
    if (!validHederaChainID(currentChainId)) {
      setHederaAccountConnected(false);
    }
    setCurrentNetwork(getNetwork(currentChainId));
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
      setAccountInfo(null);
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  return (
    <PageContainer>
      <Heading>
        Welcome to <Span>Identity Snap</Span>
      </Heading>
      <Container>
        <Row>
          <Col>
            <dt>Status:</dt>
            <dd>{currentNetwork ? 'Connected' : 'Disconnected'}</dd>
            {!currentNetwork && (
              <ConnectButton
                style={{ height: 20, minHeight: '3.2rem' }}
                onClick={handleConnectClick}
              />
            )}
            <dt>Current Network:</dt>
            <dd>{currentNetwork}</dd>
          </Col>
          <Col sm="12" md="8">
            <dt>Account Info</dt>
            {isHedera && accountInfo?.hederaAccount && (
              <>
                <dd>
                  Hedera Account ID: {accountInfo?.hederaAccount.accountId}
                </dd>
                <dd>EVM Address: {accountInfo?.hederaAccount.evmAddress}</dd>
                <dd>
                  Public Key:{' '}
                  {
                    accountInfo?.snapPrivateKeyStore[
                      `metamask-${accountInfo?.hederaAccount.evmAddress}`
                    ].publicKeyHex
                  }
                </dd>
              </>
            )}
          </Col>
        </Row>
      </Container>
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
        {requireHedera && (
          <ConnectHederaAccount
            setHederaAccountConnected={setHederaAccountConnected}
          />
        )}
        {isHedera && (
          <GetHederaAccountId setCurrentChainId={setCurrentChainId} />
        )}
        {isNonHedera && (
          <>
            <SendHelloHessage setCurrentChainId={setCurrentChainId} />
            <ToggleMetamaskPopups setCurrentChainId={setCurrentChainId} />
            <GetCurrentDIDMethod setCurrentChainId={setCurrentChainId} />
            <GetDID setCurrentChainId={setCurrentChainId} />
            <GetAccountInfo
              setCurrentChainId={setCurrentChainId}
              setAccountInfo={setAccountInfo}
            />
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
    </PageContainer>
  );
};

export default Index;
