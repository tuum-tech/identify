/* eslint-disable no-alert */
import { FC, useContext } from 'react';
import { Card, SendHelloButton } from '../../components';
import {
  MetamaskActions,
  MetaMaskContext,
} from '../../contexts/MetamaskContext';
import {
  getCurrentNetwork,
  shouldDisplayReconnectButton,
  togglePopups,
} from '../../utils';
import { validHederaChainID } from '../../utils/hedera';

type Props = {
  currentChainId: string;
  setCurrentChainId: React.Dispatch<React.SetStateAction<string>>;
  hederaAccountConnected: boolean;
};

const ToggleMetamaskPopups: FC<Props> = ({
  currentChainId,
  setCurrentChainId,
  hederaAccountConnected,
}) => {
  const [state, dispatch] = useContext(MetaMaskContext);

  const handleTogglePopupsClick = async () => {
    try {
      setCurrentChainId(await getCurrentNetwork());
      await togglePopups();
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  return (validHederaChainID(currentChainId) && hederaAccountConnected) ||
    (!validHederaChainID(currentChainId) && !hederaAccountConnected) ? (
    <Card
      content={{
        title: 'Toggle Metamask popups',
        description:
          'You can enable/disable the popups at anytime by calling this API',
        button: (
          <SendHelloButton
            buttonText="Toggle"
            onClick={handleTogglePopupsClick}
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

export default ToggleMetamaskPopups;
