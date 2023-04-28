import { useGoogleLogin } from '@react-oauth/google';
import { FC, useContext, useRef, useState } from 'react';
import {
  MetaMaskContext,
  MetamaskActions,
} from '../../contexts/MetamaskContext';
import useModal from '../../hooks/useModal';
import {
  configureGoogleAccount,
  getCurrentMetamaskAccount,
  getCurrentNetwork,
  shouldDisplayReconnectButton,
} from '../../utils';
import { Card, SendHelloButton } from '../base';
import ExternalAccount, {
  GetExternalAccountRef,
} from '../sections/ExternalAccount';

type Props = {
  setMetamaskAddress: React.Dispatch<React.SetStateAction<string>>;
  setCurrentChainId: React.Dispatch<React.SetStateAction<string>>;
};

const ConfigureGoogleAccount: FC<Props> = ({
  setMetamaskAddress,
  setCurrentChainId,
}) => {
  const [state, dispatch] = useContext(MetaMaskContext);
  const [loading, setLoading] = useState(false);
  const { showModal } = useModal();

  const externalAccountRef = useRef<GetExternalAccountRef>(null);

  const handleConfigureGoogleAccount = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);

      const metamaskAddress = await getCurrentMetamaskAccount();
      setMetamaskAddress(metamaskAddress);
      setCurrentChainId(await getCurrentNetwork());

      const externalAccountParams =
        externalAccountRef.current?.handleGetAccountParams();

      await configureGoogleAccount(
        metamaskAddress,
        tokenResponse.access_token,
        externalAccountParams,
      );
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
        form: <ExternalAccount ref={externalAccountRef} />,
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
