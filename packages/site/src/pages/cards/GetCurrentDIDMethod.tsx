/* eslint-disable no-alert */
import { FC, useContext } from 'react';
import { Card, SendHelloButton } from '../../components';
import {
  MetamaskActions,
  MetaMaskContext,
} from '../../contexts/MetamaskContext';
import {
  getCurrentDIDMethod,
  getCurrentNetwork,
  shouldDisplayReconnectButton,
} from '../../utils';

type Props = {
  setCurrentChainId: React.Dispatch<React.SetStateAction<string>>;
};

const GetCurrentDIDMethod: FC<Props> = ({ setCurrentChainId }) => {
  const [state, dispatch] = useContext(MetaMaskContext);

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

export default GetCurrentDIDMethod;
