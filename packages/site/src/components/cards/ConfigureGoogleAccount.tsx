/* eslint-disable no-alert */
import { useGoogleLogin } from '@react-oauth/google';
import { FC, useContext, useState } from 'react';
import {
  MetamaskActions,
  MetaMaskContext,
} from '../../contexts/MetamaskContext';
import useModal from '../../hooks/useModal';
import {
  configureGoogleAccount,
  shouldDisplayReconnectButton,
} from '../../utils';
import { Card, SendHelloButton } from '../base';

const ConfigureGoogleAccount: FC = () => {
  const [state, dispatch] = useContext(MetaMaskContext);
  const [loading, setLoading] = useState(false);
  const { showModal } = useModal();

  const handleConfigureGoogleAccount = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      await configureGoogleAccount(tokenResponse.access_token);
      showModal({
        title: 'Google Account Configuration',
        content: 'Google Account configuration was successful!',
      });
      setLoading(false);
    },
    onError: (e) => {
      console.error('Login Failed', e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    },
  });

  return (
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
  );
};

export { ConfigureGoogleAccount };
