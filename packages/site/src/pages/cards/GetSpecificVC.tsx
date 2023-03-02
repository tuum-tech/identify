/* eslint-disable no-alert */
import { IDataManagerQueryResult } from '@tuum-tech/identity-snap/src/veramo/plugins/verfiable-creds-manager';
import { FC, useContext } from 'react';
import { Card, SendHelloButton, TextInput } from '../../components';
import {
  MetamaskActions,
  MetaMaskContext,
} from '../../contexts/MetamaskContext';
import { VcContext } from '../../contexts/VcContext';
import {
  getCurrentNetwork,
  getVCs,
  shouldDisplayReconnectButton,
} from '../../utils';

type Props = {
  setCurrentChainId: React.Dispatch<React.SetStateAction<string>>;
};

const GetSpecificVC: FC<Props> = ({ setCurrentChainId }) => {
  const { vcId, setVcId, setVc } = useContext(VcContext);
  const [state, dispatch] = useContext(MetaMaskContext);

  const handleGetSpecificVCClick = async () => {
    try {
      setCurrentChainId(await getCurrentNetwork());
      const filter = {
        type: 'id',
        filter: vcId ? vcId.trim().split(',')[0] : undefined,
      };
      const options = {
        store: 'snap',
        returnStore: true,
      };
      const vcs = (await getVCs(filter, options)) as IDataManagerQueryResult[];
      console.log(`Your VC is: ${JSON.stringify(vcs, null, 4)}`);
      if (vcs.length > 0) {
        const keys = vcs.map((vc: { metadata: any }) => vc.metadata.id);
        if (keys.length > 0) {
          setVc(vcs[keys.length - 1].data as IDataManagerQueryResult);
        }
      }
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  return (
    <Card
      content={{
        title: 'getSpecificVC',
        description: 'Get specific VC of the user',
        form: (
          <form>
            <label>
              Enter your VC Id
              <TextInput
                rows={2}
                value={vcId ? vcId.trim().split(',')[0] : ''}
                onChange={(e) => setVcId(e.target.value)}
                fullWidth
              />
            </label>
          </form>
        ),
        button: (
          <SendHelloButton
            buttonText="Retrieve VC"
            onClick={handleGetSpecificVCClick}
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

export default GetSpecificVC;
