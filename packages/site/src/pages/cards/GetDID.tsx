/* eslint-disable no-alert */
import { FC, useContext } from 'react';
import { Card, SendHelloButton } from '../../components';
import { MetamaskActions, MetaMaskContext } from '../../hooks/MetamaskContext';
import {
  getCurrentNetwork,
  getDID,
  shouldDisplayReconnectButton,
} from '../../utils';
import { validHederaChainID } from '../../utils/hedera';

type Props = {
  currentChainId: string;
  setCurrentChainId: React.Dispatch<React.SetStateAction<string>>;
  hederaAccountConnected: boolean;
};

const GetDID: FC<Props> = ({
  currentChainId,
  setCurrentChainId,
  hederaAccountConnected,
}) => {
  const [state, dispatch] = useContext(MetaMaskContext);

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

  return (validHederaChainID(currentChainId) && hederaAccountConnected) ||
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
  ) : null;
};

export default GetDID;
