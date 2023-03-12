import { FC, useContext, useState } from 'react';
import {
  MetamaskActions,
  MetaMaskContext,
} from '../../contexts/MetamaskContext';
import { VcContext } from '../../contexts/VcContext';
import useModal from '../../hooks/useModal';
import {
  getCurrentNetwork,
  shouldDisplayReconnectButton,
  verifyVC,
} from '../../utils';
import { Card, SendHelloButton, TextInput } from '../base';

type Props = {
  setCurrentChainId: React.Dispatch<React.SetStateAction<string>>;
};

const VerifyVC: FC<Props> = ({ setCurrentChainId }) => {
  const { vc, setVc } = useContext(VcContext);
  const [state, dispatch] = useContext(MetaMaskContext);
  const [loading, setLoading] = useState(false);
  const { showModal } = useModal();

  const handleVerifyVCClick = async () => {
    setLoading(true);
    try {
      setCurrentChainId(await getCurrentNetwork());
      const verified = await verifyVC(vc);
      console.log('VC Verified: ', verified);
      showModal({ title: 'Verify VC', content: `VC Verified: ${verified}` });
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
    setLoading(false);
  };

  return (
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

export { VerifyVC };
