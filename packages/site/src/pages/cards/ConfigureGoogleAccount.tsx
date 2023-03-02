/* eslint-disable no-alert */
import { useGoogleLogin } from '@react-oauth/google';
import { FC, useContext, useState } from 'react';
import { Card, SendHelloButton } from '../../components';
import {
  MetamaskActions,
  MetaMaskContext,
} from '../../contexts/MetamaskContext';
import {
  configureGoogleAccount,
  shouldDisplayReconnectButton,
} from '../../utils';
import { validHederaChainID } from '../../utils/hedera';

type Props = {
  currentChainId: string;
  hederaAccountConnected: boolean;
};

const ConfigureGoogleAccount: FC<Props> = ({
  currentChainId,
  hederaAccountConnected,
}) => {
  const [state, dispatch] = useContext(MetaMaskContext);
  const [loading, setLoading] = useState(false);

  const handleConfigureGoogleAccount = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      await configureGoogleAccount(tokenResponse.access_token);
      alert('Google Account configuration was successful');
      setLoading(false);
    },
    onError: (e) => {
      console.error('Login Failed', e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    },
  });

  return (validHederaChainID(currentChainId) && hederaAccountConnected) ||
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
            loading={loading}
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
  ) : null;
};

export default ConfigureGoogleAccount;
