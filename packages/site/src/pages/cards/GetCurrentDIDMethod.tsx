import { FC, useContext } from 'react';
import { Card, SendHelloButton } from '../../components';
import { MetamaskActions, MetaMaskContext } from '../../hooks/MetamaskContext';
import {
  getCurrentDIDMethod,
  getCurrentNetwork,
  shouldDisplayReconnectButton,
} from '../../utils';
import { validHederaChainID } from '../../utils/hedera';

type Props = {
  currentChainId: string;
  setCurrentChainId: React.Dispatch<React.SetStateAction<string>>;
  hederaAccountConnected: boolean;
};

const GetCurrentDIDMethod: FC<Props> = ({
  currentChainId,
  setCurrentChainId,
  hederaAccountConnected,
}) => {
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

  return (validHederaChainID(currentChainId) && hederaAccountConnected) ||
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
  ) : null;
};

export default GetCurrentDIDMethod;
