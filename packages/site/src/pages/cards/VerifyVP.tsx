/* eslint-disable no-alert */
import { FC, useContext } from 'react';
import { Card, SendHelloButton, TextInput } from '../../components';
import {
  MetamaskActions,
  MetaMaskContext,
} from '../../contexts/MetamaskContext';
import { VcContext } from '../../contexts/VcContext';
import {
  getCurrentNetwork,
  shouldDisplayReconnectButton,
  verifyVP,
} from '../../utils';
import { validHederaChainID } from '../../utils/hedera';

type Props = {
  currentChainId: string;
  setCurrentChainId: React.Dispatch<React.SetStateAction<string>>;
  hederaAccountConnected: boolean;
};

const VerifyVP: FC<Props> = ({
  currentChainId,
  setCurrentChainId,
  hederaAccountConnected,
}) => {
  const { vp, setVp } = useContext(VcContext);
  const [state, dispatch] = useContext(MetaMaskContext);

  const handleVerifyVPClick = async () => {
    try {
      setCurrentChainId(await getCurrentNetwork());
      const verified = await verifyVP(vp);
      console.log('VP Verified: ', verified);
      alert(`VP Verified: ${verified}`);
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  return (validHederaChainID(currentChainId) && hederaAccountConnected) ||
    (!validHederaChainID(currentChainId) && !hederaAccountConnected) ? (
    <Card
      content={{
        title: 'verifyVP',
        description: 'Verify a VP JWT or LDS format',
        form: (
          <form>
            <label>
              Enter your Verifiable Presentation
              <TextInput
                rows={2}
                value={JSON.stringify(vp)}
                onChange={(e) => setVp(e.target.value)}
                fullWidth
              />
            </label>
          </form>
        ),
        button: (
          <SendHelloButton
            buttonText="Verify VP"
            onClick={handleVerifyVPClick}
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

export default VerifyVP;