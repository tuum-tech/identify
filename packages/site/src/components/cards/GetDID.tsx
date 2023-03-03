/* eslint-disable no-alert */
import { FC, useContext } from 'react';
import {
  MetamaskActions,
  MetaMaskContext,
} from '../../contexts/MetamaskContext';
import {
  getCurrentNetwork,
  getDID,
  shouldDisplayReconnectButton,
} from '../../utils';
import { Card, SendHelloButton } from '../base';

type Props = {
  setCurrentChainId: React.Dispatch<React.SetStateAction<string>>;
};

const GetDID: FC<Props> = ({ setCurrentChainId }) => {
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

  return (
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
  );
};

export { GetDID };
