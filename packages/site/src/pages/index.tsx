import { ProofInfo } from '@tuum-tech/identity-snap/src/types/params';
import {
  IDataManagerClearResult,
  IDataManagerDeleteResult,
  IDataManagerQueryResult,
} from '@tuum-tech/identity-snap/src/veramo/plugins/verfiable-creds-manager';
import { IVerifyResult, VerifiablePresentation } from '@veramo/core';
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
  createVC,
  createVP,
  deleteAllVCs,
  getCurrentDIDMethod,
  getDID,
  getSnap,
  getVCs,
  removeVC,
  resolveDID,
  sendHello,
  shouldDisplayReconnectButton,
  verifyVC,
  verifyVP,
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

  const [createVCName, setCreateVCName] = useState('Kiran Pachhai');
  const [createVCNickname, setCreateVCNickname] = useState('KP Woods');

  const [vcId, setVcId] = useState('');
  const [vc, setVc] = useState({});
  const [vcIdsToBeRemoved, setVcIdsToBeRemoved] = useState('');
  const [vp, setVp] = useState({});

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

  const handleResolveDIDClick = async () => {
    try {
      const doc = await resolveDID();
      console.log(`Your DID document is is: ${JSON.stringify(doc, null, 4)}`);
      alert(`Your DID document is: ${JSON.stringify(doc, null, 4)}`);
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  const handleGetVCsClick = async () => {
    try {
      /* const filter = {
        type: 'id',
        filter: '',
      }; */
      const options = {
        store: 'snap',
        returnStore: true,
      };
      const vcs = (await getVCs(
        undefined,
        options
      )) as IDataManagerQueryResult[];
      console.log(`Your VCs are: ${JSON.stringify(vcs, null, 4)}`);
      const vcsJson = JSON.parse(JSON.stringify(vcs));
      if (vcsJson.length > 0) {
        const keys = vcsJson.map((vc: { metadata: any }) => vc.metadata.id);
        if (keys) {
          setVcId(keys[keys.length - 1]);
          setVcIdsToBeRemoved(keys[keys.length - 1]);
          setVc(vcs[keys.length - 1].data as IDataManagerQueryResult);
        }
        alert(`Your VC IDs are: ${keys}`);
      }
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  const handleCreateVCClick = async () => {
    try {
      const vcKey = 'profile';
      const vcValue = {
        name: createVCName,
        nickname: createVCNickname,
      };
      const options = {
        store: 'snap',
        returnStore: true,
      };
      const credTypes = ['ProfileNamesCredential'];
      const saved = await createVC(vcKey, vcValue, options, credTypes);
      const savedJson = JSON.parse(JSON.stringify(saved));
      if (savedJson.length > 0) {
        setVcId(savedJson[0].id);
        setVcIdsToBeRemoved(savedJson[0].id);
        console.log('created and saved VC: ', saved);
      }
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  const handleVerifyVCClick = async () => {
    try {
      const result = (await verifyVC(vc)) as IVerifyResult;
      if (result.verified === false) {
        console.log('VC Verification Error: ', result.error);
        alert(
          `Your VC Verification Error is: ${JSON.stringify(
            result.error,
            null,
            4
          )}`
        );
      } else {
        console.log('VC Verified: ', result.verified);
        alert('Your VC was verified successfully');
      }
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  const handleRemoveVCClick = async () => {
    try {
      const options = {
        store: 'snap',
      };
      console.log('vcIdsToBeRemoved: ', vcIdsToBeRemoved);
      const isRemoved = (await removeVC(
        vcIdsToBeRemoved,
        options
      )) as IDataManagerDeleteResult[];
      console.log(`Remove VC Result: ${JSON.stringify(isRemoved, null, 4)}`);
      setVcIdsToBeRemoved('');
      setVcId('');
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  const handleDeleteAllVCsClick = async () => {
    try {
      const options = {
        store: 'snap',
      };
      const isRemoved = (await deleteAllVCs(
        options
      )) as IDataManagerClearResult[];
      console.log(`Remove VC Result: ${JSON.stringify(isRemoved, null, 4)}`);
      setVcIdsToBeRemoved('');
      setVcId('');
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  const handleCreateVPClick = async () => {
    try {
      const vcs = [vcId];
      const proofInfo: ProofInfo = {
        proofFormat: 'jwt',
        type: 'ProfileNamesPresentation',
        domain: 'identity.tuum.tech',
        challenge: vcId,
      };
      const vp = (await createVP(vcs, proofInfo)) as VerifiablePresentation;
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
      const result = (await verifyVP(vc)) as IVerifyResult;
      if (result.verified === false) {
        console.log('VP Verification Error: ', result.error);
        alert(
          `Your VP Verification Error is: ${JSON.stringify(
            result.error,
            null,
            4
          )}`
        );
      } else {
        console.log('VP Verified: ', result.verified);
        alert('Your VP was verified successfully');
      }
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
            title: 'resolveDID',
            description: 'Resolve the DID and return a DID document',
            button: (
              <SendHelloButton
                onClick={handleResolveDIDClick}
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
            title: 'createVC',
            description: 'Create and Save VerifiableCredential',
            form: (
              <form>
                <label>
                  Enter your name
                  <input
                    type="text"
                    value={createVCName}
                    onChange={(e) => setCreateVCName(e.target.value)}
                  />
                </label>
                <br />
                <label>
                  Enter your nickname
                  <input
                    type="text"
                    value={createVCNickname}
                    onChange={(e) => setCreateVCNickname(e.target.value)}
                  />
                </label>
              </form>
            ),
            button: (
              <SendHelloButton
                onClick={handleCreateVCClick}
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
            title: 'verifyVC',
            description: 'Verify a VC JWT, LDS format or EIP712',
            form: (
              <form>
                <label>
                  Enter your Verifiable Credential
                  <input
                    type="text"
                    value={JSON.stringify(vc)}
                    onChange={(e) => setVc(e.target.value)}
                  />
                </label>
              </form>
            ),
            button: (
              <SendHelloButton
                onClick={handleVerifyVCClick}
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
            title: 'removeVC',
            description: 'Remove one or more VCs from the snap',
            form: (
              <form>
                <label>
                  Enter your VC IDs to be removed separated by a comma
                  <input
                    type="text"
                    value={vcIdsToBeRemoved}
                    onChange={(e) => setVcIdsToBeRemoved(e.target.value)}
                  />
                </label>
              </form>
            ),
            button: (
              <SendHelloButton
                onClick={handleRemoveVCClick}
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
            title: 'deleteAllVCs',
            description: 'Delete all the VCs from the snap',
            button: (
              <SendHelloButton
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
        <Card
          content={{
            title: 'verifyVP',
            description: 'Verify a VP JWT or LDS format',
            form: (
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
            ),
            button: (
              <SendHelloButton
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
