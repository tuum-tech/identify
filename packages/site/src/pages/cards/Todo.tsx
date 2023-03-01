/* eslint-disable no-alert */
import { FC, useContext } from 'react';
import { Card, SendHelloButton } from '../../components';
import { MetaMaskContext } from '../../contexts/MetamaskContext';
import { shouldDisplayReconnectButton } from '../../utils';
import { validHederaChainID } from '../../utils/hedera';

type Props = {
  currentChainId: string;
  hederaAccountConnected: boolean;
};

const Todo: FC<Props> = ({ currentChainId, hederaAccountConnected }) => {
  const [state] = useContext(MetaMaskContext);

  const handleTodoClick = async () => {
    console.log('Not implemented');
  };

  return (validHederaChainID(currentChainId) && hederaAccountConnected) ||
    (!validHederaChainID(currentChainId) && !hederaAccountConnected) ? (
    <Card
      content={{
        title: 'todo',
        description: 'TODO',
        /* form: (
              <form>
                <label>
                  Enter your Verifiable Presentation
                  <input
                    type="text"
                    value={JSON.stringify(vp)}
                    onChange={(e) => setVp(e.target.value)}
                  />
                </label>
              </form>
            ), */
        button: (
          <SendHelloButton
            buttonText="todo"
            onClick={handleTodoClick}
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

export default Todo;
