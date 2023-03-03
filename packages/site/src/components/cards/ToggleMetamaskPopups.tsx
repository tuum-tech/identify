/* eslint-disable no-alert */
import { FC, useContext } from 'react';
import {
  MetamaskActions,
  MetaMaskContext,
} from '../../contexts/MetamaskContext';
import {
  getCurrentNetwork,
  shouldDisplayReconnectButton,
  togglePopups,
} from '../../utils';
import { Card, SendHelloButton } from '../base';

type Props = {
  setCurrentChainId: React.Dispatch<React.SetStateAction<string>>;
};

const ToggleMetamaskPopups: FC<Props> = ({ setCurrentChainId }) => {
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

  return (
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
  );
};

export { ToggleMetamaskPopups };
