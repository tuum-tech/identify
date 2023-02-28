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
  verifyVC,
} from '../../utils';
import { validHederaChainID } from '../../utils/hedera';

type Props = {
  currentChainId: string;
  setCurrentChainId: React.Dispatch<React.SetStateAction<string>>;
  hederaAccountConnected: boolean;
};

const VerifyVC: FC<Props> = ({
  currentChainId,
  setCurrentChainId,
  hederaAccountConnected,
}) => {
  const { vc, setVc } = useContext(VcContext);
  const [state, dispatch] = useContext(MetaMaskContext);

  const handleVerifyVCClick = async () => {
    try {
      setCurrentChainId(await getCurrentNetwork());
      const verified = await verifyVC(vc);
      console.log('VC Verified: ', verified);
      alert(`VC Verified: ${verified}`);
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  return (validHederaChainID(currentChainId) && hederaAccountConnected) ||
    (!validHederaChainID(currentChainId) && !hederaAccountConnected) ? (
    <Card
      content={{
        title: 'verifyVC',
        description: 'Verify a VC JWT, LDS format or EIP712',
        form: (
          <form>
            <label>
              Enter your Verifiable Credential
              <TextInput
                rows={3}
                value={JSON.stringify(vc)}
                onChange={(e) => setVc(e.target.value)}
                fullWidth
              />
            </label>
          </form>
        ),
        button: (
          <SendHelloButton
            buttonText="Verify VC"
            onClick={handleVerifyVCClick}
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

export default VerifyVC;
