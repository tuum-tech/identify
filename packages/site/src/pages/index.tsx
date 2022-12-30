import { useCallback, useContext, useState } from 'react';
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
  getCurrentDIDMethod,
  getDID,
  getSnap,
  getVCs,
  saveVC,
  sendHello,
  shouldDisplayReconnectButton,
  uploadToGoogleDrive,
} from '../utils';

const placeholderVC = {
  credentialSchema: {
    id: 'https://beta.api.schemas.serto.id/v1/public/program-completion-certificate/1.0/json-schema.json',
    type: 'JsonSchemaValidator2018',
  },
  credentialSubject: {
    accomplishmentType: 'Developer Certificate',
    learnerName: 'a',
    achievement: 'Certified Solidity Developer 2',
    courseProvider: 'UM FERI',
    id: 'did:ethr:rinkeby:0x6A24687621cDD1C77Bb6aCbBEE910d0C517eB443',
  },
  issuer: {
    id: 'did:ethr:rinkeby:0x0241abd662da06d0af2f0152a80bc037f65a7f901160cfe1eb35ef3f0c532a2a4d',
  },
  type: ['VerifiableCredential', 'ProgramCompletionCertificate'],
  '@context': [
    'https://www.w3.org/2018/credentials/v1',
    'https://beta.api.schemas.serto.id/v1/public/program-completion-certificate/1.0/ld-context.json',
  ],
  issuanceDate: '2022-06-13T12:08:10.000Z',
  proof: {
    type: 'JwtProof2020',
    jwt: 'eyJhbGciOiJFUzI1NksiLCJ0eXAiOiJKV1QifQ.eyJ2YyI6eyJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MSIsImh0dHBzOi8vYmV0YS5hcGkuc2NoZW1hcy5zZXJ0by5pZC92MS9wdWJsaWMvcHJvZ3JhbS1jb21wbGV0aW9uLWNlcnRpZmljYXRlLzEuMC9sZC1jb250ZXh0Lmpzb24iXSwidHlwZSI6WyJWZXJpZmlhYmxlQ3JlZGVudGlhbCIsIlByb2dyYW1Db21wbGV0aW9uQ2VydGlmaWNhdGUiXSwiY3JlZGVudGlhbFN1YmplY3QiOnsiYWNjb21wbGlzaG1lbnRUeXBlIjoiRGV2ZWxvcGVyIENlcnRpZmljYXRlIiwibmFtZSI6ImEiLCJhY2hpZXZlbWVudCI6IkNlcnRpZmllZCBTb2xpZGl0eSBEZXZlbG9wZXIgMiIsImNvdXJzZVByb3ZpZGVyIjoiVU0gRkVSSSJ9LCJjcmVkZW50aWFsU2NoZW1hIjp7ImlkIjoiaHR0cHM6Ly9iZXRhLmFwaS5zY2hlbWFzLnNlcnRvLmlkL3YxL3B1YmxpYy9wcm9ncmFtLWNvbXBsZXRpb24tY2VydGlmaWNhdGUvMS4wL2pzb24tc2NoZW1hLmpzb24iLCJ0eXBlIjoiSnNvblNjaGVtYVZhbGlkYXRvcjIwMTgifX0sInN1YiI6ImRpZDpldGhyOnJpbmtlYnk6MHg2QTI0Njg3NjIxY0REMUM3N0JiNmFDYkJFRTkxMGQwQzUxN2VCNDQzIiwibmJmIjoxNjUyNDQzNjkwLCJpc3MiOiJkaWQ6ZXRocjpyaW5rZWJ5OjB4MDI0MWFiZDY2MmRhMDZkMGFmMmYwMTUyYTgwYmMwMzdmNjVhN2Y5MDExNjBjZmUxZWIzNWVmM2YwYzUzMmEyYTRkIn0.Z4q7kn4vKdFI5QfAyQmqtWa0icAv91HqxSEwn-AMr4_bY3vfD_WeD3W9hgqf9tsUJPx2ru5gY3tLpAx04nk0RQ',
  },
};

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

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
`;

const Index = () => {
  const [state, dispatch] = useContext(MetaMaskContext);
  const [hederaAccountConfigure, setHederaAccountConfigure] = useState(false);
  const [vcText, setVCText] = useState(JSON.stringify(placeholderVC));
  const [fileName, setFileName] = useState('');

  const [hederaPrivateKey, setHederaPrivateKey] = useState(
    '2386d1d21644dc65d4e4b9e2242c5f155cab174916cbc46ad85622cdaeac835c'
  );
  const [hederaAccountId, setHederaAccountId] = useState('0.0.48865029');

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

  const handleSaveVClick = async () => {
    try {
      const vc = JSON.parse(vcText);
      await saveVC(vc);
      console.log(`Your VC Store was saved`);
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  const handleSaveToDrive = async () => {
    try {
      if (!fileName) {
        console.error('File name is missing.');
        return;
      }
      if (!vcText) {
        console.error('VC text is empty');
      }
      await uploadToGoogleDrive({ fileName, content: vcText });
      console.log(`Your VC Store was saved to google drive`);
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  const handleGetVCsClick = async () => {
    try {
      const vcs = await getVCs();
      console.log('Your VC Store is: ', vcs);
      // alert(`Your DID is: ${did}`);
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  const handleVcTextChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => setVCText(e.target.value),
    [setVCText]
  );

  const handleFileNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setFileName(e.target.value),
    [setVCText]
  );

  return (
    <Container>
      <Heading>
        Welcome to <Span>template-snap</Span>
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
            title: 'saveVC',
            description: 'Save VC',
            form: (
              <>
                <textarea
                  id="VC"
                  rows="10"
                  cols="50"
                  onChange={handleVcTextChange}
                  value={vcText}
                />
                <input
                  id="file-name"
                  type="text"
                  placeholder="File Name"
                  value={fileName}
                  onChange={handleFileNameChange}
                />
              </>
            ),
            button: (
              <ButtonContainer>
                <SendHelloButton
                  onClick={handleSaveVClick}
                  disabled={!state.installedSnap}
                />
                <SendHelloButton
                  onClick={handleSaveToDrive}
                  disabled={!state.installedSnap}
                  title="Save to Google Drive"
                />
              </ButtonContainer>
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
