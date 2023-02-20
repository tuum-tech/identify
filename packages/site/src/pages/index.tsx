import { useGoogleLogin } from '@react-oauth/google';
import { ProofInfo } from '@tuum-tech/identity-snap/src/types/params';
import {
  IDataManagerClearResult,
  IDataManagerDeleteResult,
  IDataManagerQueryResult,
} from '@tuum-tech/identity-snap/src/veramo/plugins/verfiable-creds-manager';
import { VerifiablePresentation } from '@veramo/core';
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
import { MetamaskActions, MetaMaskContext } from '../hooks';
import {
  configureGoogleAccount,
  connectHederaAccount,
  connectSnap,
  createVC,
  createVP,
  deleteAllVCs,
  getCurrentDIDMethod,
  getCurrentNetwork,
  getDID,
  getHederaAccountId,
  getSnap,
  getVCs,
  removeVC,
  resolveDID,
  sendHello,
  shouldDisplayReconnectButton,
  syncGoogleVCs,
  togglePopups,
  verifyVC,
  verifyVP,
} from '../utils';
import { validHederaChainID } from '../utils/hedera';

const Index = () => {
  const [state, dispatch] = useContext(MetaMaskContext);
  const [currentChainId, setCurrentChainId] = useState('');
  const [hederaAccountConnected, setHederaAccountConnected] = useState(false);

  const [hederaPrivateKey, setHederaPrivateKey] = useState(
    '2386d1d21644dc65d4e4b9e2242c5f155cab174916cbc46ad85622cdaeac835c',
  );
  const [hederaAccountId, setHederaAccountId] = useState('0.0.15215');

  const [createVCName, setCreateVCName] = useState('Kiran Pachhai');
  const [createVCNickname, setCreateVCNickname] = useState('KP Woods');

  const [vcId, setVcId] = useState('');
  const [vc, setVc] = useState({});
  const [vcIdsToBeRemoved, setVcIdsToBeRemoved] = useState('');
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

  const handleGetCurrentDIDMethodClick = async () => {
    try {
      setCurrentChainId(await getCurrentNetwork());
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
      setCurrentChainId(await getCurrentNetwork());
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
      setCurrentChainId(await getCurrentNetwork());
      const doc = await resolveDID();
      console.log(`Your DID document is is: ${JSON.stringify(doc, null, 4)}`);
      alert(`Your DID document is: ${JSON.stringify(doc, null, 4)}`);
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  const handleGetSpecificVCClick = async () => {
    try {
      setCurrentChainId(await getCurrentNetwork());
      const filter = {
        type: 'id',
        filter: vcId ? vcId.trim().split(',')[0] : undefined,
      };
      const options = {
        store: 'snap',
        returnStore: true,
      };
      const vcs = (await getVCs(filter, options)) as IDataManagerQueryResult[];
      console.log(`Your VC is: ${JSON.stringify(vcs, null, 4)}`);
      if (vcs.length > 0) {
        const keys = vcs.map((vc: { metadata: any }) => vc.metadata.id);
        if (keys.length > 0) {
          setVc(vcs[keys.length - 1].data as IDataManagerQueryResult);
        }
      }
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  const handleGetVCsClick = async () => {
    try {
      setCurrentChainId(await getCurrentNetwork());
      const options = {
        // If you want to retrieve VCs from multiple stores, you can pass an array like so:
        // store: ['snap', 'googleDrive'],
        store: 'snap',
        returnStore: true,
      };
      const vcs = (await getVCs(
        undefined,
        options,
      )) as IDataManagerQueryResult[];
      console.log(`Your VCs are: ${JSON.stringify(vcs, null, 4)}`);
      if (vcs.length > 0) {
        const keys = vcs.map((vc: { metadata: any }) => vc.metadata.id);
        if (keys.length > 0) {
          setVcId(keys.toString());
          setVcIdsToBeRemoved(keys.toString());
          setVc(vcs[keys.length - 1].data as IDataManagerQueryResult);
          alert(`Your VC IDs are: ${keys.toString()}`);
        }
      }
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  const handleCreateVCClick = async () => {
    try {
      setCurrentChainId(await getCurrentNetwork());
      const vcKey = 'profile';
      const vcValue = {
        name: createVCName,
        nickname: createVCNickname,
      };
      const options = {
        // If you want to auto save the generated VCs to multiple stores, you can pass an array like so:
        // store: ['snap', 'googleDrive'],
        store: 'snap',
        returnStore: true,
      };
      const credTypes = ['ProfileNamesCredential'];
      const saved = await createVC(vcKey, vcValue, options, credTypes);
      const savedJson = JSON.parse(JSON.stringify(saved));
      if (savedJson.length > 0) {
        const vcIdsToAdd: any = [];
        savedJson.forEach((data: any) => {
          vcIdsToAdd.push(data.id);
        });
        setVcId(vcIdsToAdd.toString());
        setVcIdsToBeRemoved(vcIdsToAdd.toString());
        console.log('created and saved VC: ', saved);
      }
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  const handleVerifyVCClick = async () => {
    try {
      setCurrentChainId(await getCurrentNetwork());
      const verified = await verifyVC(vc);
      console.log('VC Verified: ', verified);
      alert(`VC Verified: ${verified}`);
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  const handleRemoveVCClick = async () => {
    try {
      setCurrentChainId(await getCurrentNetwork());
      const id = vcIdsToBeRemoved ? vcIdsToBeRemoved.trim().split(',')[0] : '';
      const options = {
        // If you want to remove the VCs from multiple stores, you can pass an array like so:
        // store: ['snap', 'googleDrive'],
        store: 'snap',
      };
      console.log('vcIdsToBeRemoved: ', vcIdsToBeRemoved);
      const isRemoved = (await removeVC(
        id,
        options,
      )) as IDataManagerDeleteResult[];
      console.log(`Remove VC Result: ${JSON.stringify(isRemoved, null, 4)}`);
      setVcId('');
      setVcIdsToBeRemoved('');
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
      <CardContainer>
        {state.error && (
          <ErrorMessage>
            <b>An error happened:</b> {state.error.message}
          </ErrorMessage>
        )}
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
        {(validHederaChainID(currentChainId) && hederaAccountConnected) ||
        (!validHederaChainID(currentChainId) && !hederaAccountConnected) ? (
          <Card
            content={{
              title: 'getCurrentDIDMethod',
              description: 'Get the current DID method to use',
              button: (
                <SendHelloButton
                  buttonText="Get DID method"
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
        ) : (
          ''
        )}
        {/* =============================================================================== */}
        {(validHederaChainID(currentChainId) && hederaAccountConnected) ||
        (!validHederaChainID(currentChainId) && !hederaAccountConnected) ? (
          <Card
            content={{
              title: 'getDID',
              description: 'Get the current DID of the user',
              button: (
                <SendHelloButton
                  buttonText="Get DID"
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
        ) : (
          ''
        )}
        {/* =============================================================================== */}
        {(validHederaChainID(currentChainId) && hederaAccountConnected) ||
        (!validHederaChainID(currentChainId) && !hederaAccountConnected) ? (
          <Card
            content={{
              title: 'resolveDID',
              description: 'Resolve the DID and return a DID document',
              button: (
                <SendHelloButton
                  buttonText="Resolve DID"
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
        ) : (
          ''
        )}
        {/* =============================================================================== */}
        {(validHederaChainID(currentChainId) && hederaAccountConnected) ||
        (!validHederaChainID(currentChainId) && !hederaAccountConnected) ? (
          <Card
            content={{
              title: 'getSpecificVC',
              description: 'Get specific VC of the user',
              form: (
                <form>
                  <label>
                    Enter your VC Id
                    <input
                      type="text"
                      value={vcId ? vcId.trim().split(',')[0] : ''}
                      onChange={(e) => setVcId(e.target.value)}
                    />
                  </label>
                </form>
              ),
              button: (
                <SendHelloButton
                  buttonText="Retrieve VC"
                  onClick={handleGetSpecificVCClick}
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
              title: 'getAllVCs',
              description: 'Get all the VCs of the user',
              button: (
                <SendHelloButton
                  buttonText="Retrieve all VCs"
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
        ) : (
          ''
        )}
        {/* =============================================================================== */}
        {(validHederaChainID(currentChainId) && hederaAccountConnected) ||
        (!validHederaChainID(currentChainId) && !hederaAccountConnected) ? (
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
                  buttonText="Generate VC"
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
        ) : (
          ''
        )}
        {/* =============================================================================== */}
        {(validHederaChainID(currentChainId) && hederaAccountConnected) ||
        (!validHederaChainID(currentChainId) && !hederaAccountConnected) ? (
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
                  buttonText="Verify VC"
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
        ) : (
          ''
        )}
        {/* =============================================================================== */}
        {(validHederaChainID(currentChainId) && hederaAccountConnected) ||
        (!validHederaChainID(currentChainId) && !hederaAccountConnected) ? (
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
                      value={
                        vcIdsToBeRemoved
                          ? vcIdsToBeRemoved.trim().split(',')[0]
                          : ''
                      }
                      onChange={(e) => setVcIdsToBeRemoved(e.target.value)}
                    />
                  </label>
                </form>
              ),
              button: (
                <SendHelloButton
                  buttonText="Delete VC"
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
        ) : (
          ''
        )}
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
