import { FC, useContext, useState } from 'react';
import {
  MetamaskActions,
  MetaMaskContext,
} from '../../contexts/MetamaskContext';
import useModal from '../../hooks/useModal';
import {
  getCurrentDIDMethod,
  getCurrentNetwork,
  shouldDisplayReconnectButton,
} from '../../utils';
import { Card, SendHelloButton } from '../base';

type Props = {
  setCurrentChainId: React.Dispatch<React.SetStateAction<string>>;
};

const GetCurrentDIDMethod: FC<Props> = ({ setCurrentChainId }) => {
  const [state, dispatch] = useContext(MetaMaskContext);
  const [loading, setLoading] = useState(false);
  const { showModal } = useModal();

  const handleGetCurrentDIDMethodClick = async () => {
    setLoading(true);
    try {
      setCurrentChainId(await getCurrentNetwork());
      const currentDIDMethod = await getCurrentDIDMethod();
      showModal({
        title: 'Current DID method',
        content: `Your current DID method is: ${currentDIDMethod}`,
      });
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
    setLoading(false);
  };

  return (
    <Card
      content={{
        title: 'getCurrentDIDMethod',
        description: 'Get the current DID method to use',
        button: (
          <SendHelloButton
            buttonText="Get DID method"
            onClick={handleGetCurrentDIDMethodClick}
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

export { GetCurrentDIDMethod };
