/* eslint-disable no-alert */
import { FC, useContext } from 'react';
import { Card, SendHelloButton } from '../../components';
import {
  MetamaskActions,
  MetaMaskContext,
} from '../../contexts/MetamaskContext';
import {
  getCurrentNetwork,
  resolveDID,
  shouldDisplayReconnectButton,
} from '../../utils';
import { validHederaChainID } from '../../utils/hedera';

type Props = {
  currentChainId: string;
  setCurrentChainId: React.Dispatch<React.SetStateAction<string>>;
  hederaAccountConnected: boolean;
};

const ResolveDID: FC<Props> = ({
  currentChainId,
  setCurrentChainId,
  hederaAccountConnected,
}) => {
  const [state, dispatch] = useContext(MetaMaskContext);

  const handleResolveDIDClick = async () => {
    try {
      setCurrentChainId(await getCurrentNetwork());
      const doc = await resolveDID();
      console.log(`Your DID document is is: ${JSON.stringify(doc, null, 4)}`);
      alert(`Your DID document is: ${JSON.stringify(doc, null, 4)}`);
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  return (validHederaChainID(currentChainId) && hederaAccountConnected) ||
    (!validHederaChainID(currentChainId) && !hederaAccountConnected) ? (
    <Card
      content={{
        title: 'resolveDID',
        description: 'Resolve the DID and return a DID document',
        button: (
          <SendHelloButton
            buttonText="Resolve DID"
            onClick={handleResolveDIDClick}
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

export default ResolveDID;
