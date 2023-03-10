import { ProofInfo } from '@tuum-tech/identity-snap/src/types/params';
import { VerifiablePresentation } from '@veramo/core';
import { FC, useContext, useState } from 'react';
import {
  MetamaskActions,
  MetaMaskContext,
} from '../../contexts/MetamaskContext';
import { VcContext } from '../../contexts/VcContext';
import useModal from '../../hooks/useModal';
import {
  createVP,
  getCurrentNetwork,
  shouldDisplayReconnectButton,
} from '../../utils';
import { Card, SendHelloButton, TextInput } from '../base';

type Props = {
  setCurrentChainId: React.Dispatch<React.SetStateAction<string>>;
};

const GetVP: FC<Props> = ({ setCurrentChainId }) => {
  const { vcId, setVcId, setVp } = useContext(VcContext);
  const [state, dispatch] = useContext(MetaMaskContext);
  const [loading, setLoading] = useState(false);
  const { showModal } = useModal();

  const handleCreateVPClick = async () => {
    setLoading(true);
    try {
      setCurrentChainId(await getCurrentNetwork());
      const proofInfo: ProofInfo = {
        proofFormat: 'jwt',
        type: 'ProfileNamesPresentation',
      };
      console.log('vcId: ', vcId);
      const vp = (await createVP(
        vcId.trim().split(','),
        proofInfo,
      )) as VerifiablePresentation;
      setVp(vp);
      showModal({
        title: 'Get VP',
        content: `Your VP is: ${JSON.stringify(vp, null, 4)}`,
      });
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
    setLoading(false);
  };

  return (
    <Card
      content={{
        title: 'getVP',
        description: 'Generate Verifiable Presentation from your VC',
        form: (
          <form>
            <label>
              Enter the Verifiable Credential ID
              <TextInput
                rows={2}
                value={vcId}
                onChange={(e) => setVcId(e.target.value)}
                fullWidth
              />
            </label>
          </form>
        ),
        button: (
          <SendHelloButton
            buttonText="Generate VP"
            onClick={handleCreateVPClick}
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

export { GetVP };