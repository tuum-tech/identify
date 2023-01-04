import { useContext, useState } from 'react';
import styled from 'styled-components';
import {
  Card,
  ConnectButton,
  InstallFlaskButton,
  ReconnectButton,
  SendHelloButton,
} from '../components';
import { MetamaskActions, MetaMaskContext } from '../hooks';
import {
  configureHederaAccount,
  connectSnap,
  createExampleVC,
  getCurrentDIDMethod,
  getDID,
  getSnap,
  getVCs,
  getVP,
  sendHello,
  shouldDisplayReconnectButton,
} from '../utils';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  margin-top: 7.6rem;
  margin-bottom: 7.6rem;
  ${({ theme }) => theme.mediaQueries.small} {
    padding-left: 2.4rem;
    padding-right: 2.4rem;
    margin-top: 2rem;
    margin-bottom: 2rem;
    width: auto;
  }
`;

const Heading = styled.h1`
  margin-top: 0;
  margin-bottom: 2.4rem;
  text-align: center;
`;

const Span = styled.span`
  color: ${(props) => props.theme.colors.primary.default};
`;

const Subtitle = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.large};
  font-weight: 500;
  margin-top: 0;
  margin-bottom: 0;
  ${({ theme }) => theme.mediaQueries.small} {
    font-size: ${({ theme }) => theme.fontSizes.text};
  }
`;

const CardContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  max-width: 64.8rem;
  width: 100%;
  height: 100%;
  margin-top: 1.5rem;
`;

const Notice = styled.div`
  background-color: ${({ theme }) => theme.colors.background.alternative};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  color: ${({ theme }) => theme.colors.text.alternative};
  border-radius: ${({ theme }) => theme.radii.default};
  padding: 2.4rem;
  margin-top: 2.4rem;
  max-width: 60rem;
  width: 100%;

  & > * {
    margin: 0;
  }
  ${({ theme }) => theme.mediaQueries.small} {
    margin-top: 1.2rem;
    padding: 1.6rem;
  }
`;

const ErrorMessage = styled.div`
  background-color: ${({ theme }) => theme.colors.error.muted};
  border: 1px solid ${({ theme }) => theme.colors.error.default};
  color: ${({ theme }) => theme.colors.error.alternative};
  border-radius: ${({ theme }) => theme.radii.default};
  padding: 2.4rem;
  margin-bottom: 2.4rem;
  margin-top: 2.4rem;
  max-width: 60rem;
  width: 100%;
  ${({ theme }) => theme.mediaQueries.small} {
    padding: 1.6rem;
    margin-bottom: 1.2rem;
    margin-top: 1.2rem;
    max-width: 100%;
  }
`;

const Index = () => {
  const [state, dispatch] = useContext(MetaMaskContext);
  const [hederaAccountConfigure, setHederaAccountConfigure] = useState(false);

  const [hederaPrivateKey, setHederaPrivateKey] = useState(
    '2386d1d21644dc65d4e4b9e2242c5f155cab174916cbc46ad85622cdaeac835c'
  );
  const [hederaAccountId, setHederaAccountId] = useState('0.0.48865029');
  const [createExampleVCName, setCreateExampleVCName] =
    useState('Tuum Identity Snap');
  const [createExampleVCValue, setCreateExampleVCValue] =
    useState('Example VC');
  const [vcId, setVcId] = useState('');

  const handleConnectClick = async () => {
    try {
      await connectSnap();
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

  const handleSendHelloClick = async () => {
    try {
      await sendHello();
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  const handleConfigureHederaAccountClick = async () => {
    try {
      const configured = await configureHederaAccount(
        hederaPrivateKey,
        hederaAccountId
      );
      console.log('configured: ', configured);
      if (configured) {
        setHederaAccountConfigure(true);
        alert('Hedera Account configuration was successful');
      } else {
        console.log('Hedera Account was not configured correctly');
      }
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  const handleGetCurrentDIDMethodClick = async () => {
    try {
      const currentDIDMethod = await getCurrentDIDMethod();
      console.log(`Your current DID method is: ${currentDIDMethod}`);
      alert(`Your current DID method is: ${currentDIDMethod}`);
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  const handleGetDIDClick = async () => {
    try {
      const did = await getDID();
      console.log(`Your DID is: ${did}`);
      alert(`Your DID is: ${did}`);
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  const handleGetVCsClick = async () => {
    try {
      const vcs = await getVCs();
      console.log(`Your VCs are: ${JSON.stringify(vcs, null, 4)}`);
      const vcsJson = JSON.parse(JSON.stringify(vcs));
      const keys = vcsJson.map((vc: { key: any }) => vc.key);
      if (keys) {
        setVcId(keys[keys.length - 1]);
      }
      alert(`Your VC IDs are: ${keys}`);
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  const handleCreateExampleVCClick = async () => {
    try {
      const saved = await createExampleVC(
        createExampleVCName,
        createExampleVCValue
      );
      console.log('created and saved VC: ', saved);
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  const handleGetVPClick = async () => {
    try {
      const vp = await getVP(vcId);
      console.log(`Your VP is: ${JSON.stringify(vp, null, 4)}`);
      alert(`Your VP is: ${JSON.stringify(vp, null, 4)}`);
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
              title: 'Connect',
              description:
                'Get started by connecting to and installing the example snap.',
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
              title: 'Reconnect',
              description:
                'While connected to a local running snap this button will always be displayed in order to update the snap if a change is made.',
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
        <Card
          content={{
            title: 'Send Hello message',
            description:
              'Display a custom message within a confirmation screen in MetaMask.',
            button: (
              <SendHelloButton
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
        <Card
          content={{
            title: 'configureHederaAccount',
            description: 'Configure your Hedera Account',
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
        <Card
          content={{
            title: 'getCurrentDIDMethod',
            description: 'Get the current DID method to use',
            button: (
              <SendHelloButton
                onClick={handleGetCurrentDIDMethodClick}
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
        <Card
          content={{
            title: 'getDID',
            description: 'Get the current DID of the user',
            button: (
              <SendHelloButton
                onClick={handleGetDIDClick}
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
        <Card
          content={{
            title: 'getVCs',
            description: 'Get the VCs of the user',
            button: (
              <SendHelloButton
                onClick={handleGetVCsClick}
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
        <Card
          content={{
            title: 'createExampleVC',
            description: 'Create and Save VerifiableCredential',
            form: (
              <form>
                <label>
                  Enter name of your VC
                  <input
                    type="text"
                    value={createExampleVCName}
                    onChange={(e) => setCreateExampleVCName(e.target.value)}
                  />
                </label>
                <br />
                <label>
                  Enter value of your VC
                  <input
                    type="text"
                    value={createExampleVCValue}
                    onChange={(e) => setCreateExampleVCValue(e.target.value)}
                  />
                </label>
              </form>
            ),
            button: (
              <SendHelloButton
                onClick={handleCreateExampleVCClick}
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
        <Card
          content={{
            title: 'getVP',
            description: 'Generate Verifiable Presentation from your VC',
            form: (
              <form>
                <label>
                  Enter the Verifiable Credential ID
                  <input
                    type="text"
                    value={vcId}
                    onChange={(e) => setVcId(e.target.value)}
                  />
                </label>
              </form>
            ),
            button: (
              <SendHelloButton
                onClick={handleGetVPClick}
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
        <Notice>
          <p>
            Please note that the <b>snap.manifest.json</b> and{' '}
            <b>package.json</b> must be located in the server root directory and
            the bundle must be hosted at the location specified by the location
            field.
          </p>
        </Notice>
      </CardContainer>
    </Container>
  );
};

export default Index;
