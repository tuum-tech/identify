import { useContext, useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

import { Card, InstallFlaskButton } from '../components/base';
import {
  ConfigureGoogleAccount,
  ConnectIdentitySnap,
  CreateNewHederaAccount,
  CreateVC,
  DeleteAllVCs,
  GetAccountInfo,
  GetAllVCs,
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
import {
  connectSnap,
  getCurrentNetwork,
  getSnap,
  PublicAccountInfo,
} from '../utils';
import { getNetwork, validHederaChainID } from '../utils/hedera';

const Index = () => {
  const [state, dispatch] = useContext(MetaMaskContext);
  const [currentChainId, setCurrentChainId] = useState('');
  const [isHederaNetwork, setIsHederaNetwork] = useState(false);
  const [currentNetwork, setCurrentNetwork] = useState('');
  const [accountInfo, setAccountInfo] = useState<PublicAccountInfo>(
    {} as PublicAccountInfo,
  );

  useEffect(() => {
    if (validHederaChainID(currentChainId)) {
      setIsHederaNetwork(true);
    } else {
      setIsHederaNetwork(false);
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
      setAccountInfo({} as PublicAccountInfo);
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
            <dt>Current Network:</dt>
            <dd>{currentNetwork}</dd>
          </Col>
          <Col sm="12" md="8">
            <dt>Account Info</dt>
            {isHederaNetwork
              ? accountInfo && (
                  <>
                    <dd>Hedera Account ID: {accountInfo.hederaAccountId}</dd>
                    <dd>Did Method: {accountInfo?.method}</dd>
                    <dd>Did: {accountInfo?.did}</dd>
                    <dd>EVM Address: {accountInfo?.evmAddress}</dd>
                    <dd>Public Key: {accountInfo?.publicKey}</dd>
                  </>
                )
              : accountInfo && (
                  <>
                    <dd>Did Method: {accountInfo?.method}</dd>
                    <dd>Did: {accountInfo?.did}</dd>
                    <dd>EVM Address: {accountInfo?.evmAddress}</dd>
                    <dd>Public Key: {accountInfo?.publicKey}</dd>
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

        <SendHelloHessage setCurrentChainId={setCurrentChainId} />

        {isHederaNetwork && (
          <CreateNewHederaAccount setCurrentChainId={setCurrentChainId} />
        )}

        <ToggleMetamaskPopups setCurrentChainId={setCurrentChainId} />
        <GetAccountInfo
          currentChainId={currentChainId}
          setCurrentChainId={setCurrentChainId}
          setAccountInfo={setAccountInfo}
        />
        <ResolveDID
          currentChainId={currentChainId}
          setCurrentChainId={setCurrentChainId}
        />
        <GetSpecificVC
          currentChainId={currentChainId}
          setCurrentChainId={setCurrentChainId}
        />
        <GetAllVCs
          currentChainId={currentChainId}
          setCurrentChainId={setCurrentChainId}
        />
        <CreateVC
          currentChainId={currentChainId}
          setCurrentChainId={setCurrentChainId}
        />
        <VerifyVC setCurrentChainId={setCurrentChainId} />
        <RemoveVC
          currentChainId={currentChainId}
          setCurrentChainId={setCurrentChainId}
        />
        <DeleteAllVCs
          currentChainId={currentChainId}
          setCurrentChainId={setCurrentChainId}
        />
        <GetVP
          currentChainId={currentChainId}
          setCurrentChainId={setCurrentChainId}
        />
        <VerifyVP setCurrentChainId={setCurrentChainId} />
        <ConfigureGoogleAccount />
        <SyncGoogleVCs />
        <Todo />
        <Todo />
        <Todo />
      </CardContainer>
    </PageContainer>
  );
};

export default Index;
