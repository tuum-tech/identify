import { FC, useContext, useState } from 'react';
import {
  MetamaskActions,
  MetaMaskContext,
} from '../../contexts/MetamaskContext';
import useModal from '../../hooks/useModal';
import {
  getAccountInfo,
  getCurrentNetwork,
  PublicAccountInfo,
  shouldDisplayReconnectButton,
} from '../../utils';
import { Card, SendHelloButton } from '../base';

type Props = {
  setCurrentChainId: React.Dispatch<React.SetStateAction<string>>;
  setAccountInfo: React.Dispatch<React.SetStateAction<PublicAccountInfo>>;
};

const GetAccountInfo: FC<Props> = ({ setCurrentChainId, setAccountInfo }) => {
  const [state, dispatch] = useContext(MetaMaskContext);
  const [loading, setLoading] = useState(false);
  const { showModal } = useModal();

  const handleGetAccountInfoClick = async () => {
    setLoading(true);
    try {
      setCurrentChainId(await getCurrentNetwork());
      const accountInfo = await getAccountInfo();
      console.log(`Your account info:`, accountInfo);
      setAccountInfo(accountInfo as PublicAccountInfo);
      showModal({
        title: 'Your account info',
        content: JSON.stringify(accountInfo),
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
        title: 'getAccountInfo',
        description: 'Get the current account information',
        button: (
          <SendHelloButton
            buttonText="Get Account Info"
            onClick={handleGetAccountInfoClick}
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

export { GetAccountInfo };
