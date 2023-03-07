/* eslint-disable no-alert */
import { FC, useContext } from 'react';
import {
  MetamaskActions,
  MetaMaskContext,
} from '../../contexts/MetamaskContext';
import {
  getAccountInfo,
  getCurrentNetwork,
  shouldDisplayReconnectButton,
} from '../../utils';
import { Card, SendHelloButton } from '../base';

type Props = {
  setCurrentChainId: React.Dispatch<React.SetStateAction<string>>;
  setAccountInfo: React.Dispatch<React.SetStateAction<unknown>>;
};

const GetAccountInfo: FC<Props> = ({ setCurrentChainId, setAccountInfo }) => {
  const [state, dispatch] = useContext(MetaMaskContext);

  const handleGetAccountInfoClick = async () => {
    try {
      setCurrentChainId(await getCurrentNetwork());
      const accountInfo = await getAccountInfo();
      setAccountInfo(accountInfo);
      console.log(`Your account info:`, accountInfo);
      alert(`Your account info: ${JSON.stringify(accountInfo)}`);
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  return (
    <Card
      content={{
        title: 'getAccountInfo',
        description: 'Get the current account information',
        button: (
          <SendHelloButton
            buttonText="Get Account Info"
            onClick={handleGetAccountInfoClick}
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

export { GetAccountInfo };
