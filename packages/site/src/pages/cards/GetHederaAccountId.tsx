/* eslint-disable no-alert */
import { FC, useContext } from 'react';
import { Card, SendHelloButton } from '../../components';
import {
  MetamaskActions,
  MetaMaskContext,
} from '../../contexts/MetamaskContext';
import {
  getCurrentNetwork,
  getHederaAccountId,
  shouldDisplayReconnectButton,
} from '../../utils';

type Props = {
  setCurrentChainId: React.Dispatch<React.SetStateAction<string>>;
};

const GetHederaAccountId: FC<Props> = ({ setCurrentChainId }) => {
  const [state, dispatch] = useContext(MetaMaskContext);

  const handleGetHederaAccountIdClick = async () => {
    try {
      setCurrentChainId(await getCurrentNetwork());
      const accountId = await getHederaAccountId();
      console.log(`Your Hedera Account Id is: ${accountId}`);
      alert(`Your Hedera Account Id is: ${accountId}`);
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  return (
    <Card
      content={{
        title: 'getHederaAccountId',
        description: 'Retrieve Hedera Account Id',
        button: (
          <SendHelloButton
            buttonText="Get Account Id"
            onClick={handleGetHederaAccountIdClick}
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

export { GetHederaAccountId };
