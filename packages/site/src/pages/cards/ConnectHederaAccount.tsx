/* eslint-disable no-alert */
import { FC, useContext, useState } from 'react';
import { Card, SendHelloButton } from '../../components';
import {
  MetamaskActions,
  MetaMaskContext,
} from '../../contexts/MetamaskContext';
import {
  connectHederaAccount,
  shouldDisplayReconnectButton,
} from '../../utils';

type Props = {
  setHederaAccountConnected: React.Dispatch<React.SetStateAction<boolean>>;
};

const ConnectHederaAccount: FC<Props> = ({ setHederaAccountConnected }) => {
  const [state, dispatch] = useContext(MetaMaskContext);
  const [hederaAccountId, setHederaAccountId] = useState('0.0.15215');
  const [loading, setLoading] = useState(false);

  const handleConfigureHederaAccountClick = async () => {
    setLoading(true);
    try {
      const configured = await connectHederaAccount(hederaAccountId);
      console.log('configured: ', configured);
      if (configured) {
        setHederaAccountConnected(true);
        alert('Hedera Account configuration was successful');
      } else {
        console.log('Hedera Account was not configured correctly');
      }
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
    setLoading(false);
  };

  return (
    <Card
      content={{
        title: 'connectHederaAccount',
        description:
          'Connect to Hedera Account. NOTE that you will need to reconnect to Hedera Account if you switch the network on Metamask at any point in time as that will cause your metamask state to point to your non-hedera account on metamask',
        form: (
          <form>
            <label>
              Enter your Hedera Account ID
              <input
                type="text"
                value={hederaAccountId}
                onChange={(e) => setHederaAccountId(e.target.value)}
              />
            </label>
          </form>
        ),
        button: (
          <SendHelloButton
            buttonText="Connect to Hedera Account"
            onClick={handleConfigureHederaAccountClick}
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

export default ConnectHederaAccount;
