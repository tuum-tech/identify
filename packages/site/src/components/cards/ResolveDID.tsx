/* eslint-disable no-alert */
import { FC, useContext } from 'react';
import {
  MetamaskActions,
  MetaMaskContext,
} from '../../contexts/MetamaskContext';
import {
  getCurrentNetwork,
  resolveDID,
  shouldDisplayReconnectButton,
} from '../../utils';
import { Card, SendHelloButton } from '../base';

type Props = {
  setCurrentChainId: React.Dispatch<React.SetStateAction<string>>;
};

const ResolveDID: FC<Props> = ({ setCurrentChainId }) => {
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

  return (
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
  );
};

export { ResolveDID };
