/* eslint-disable no-alert */
import { IDataManagerDeleteResult } from '@tuum-tech/identity-snap/src/veramo/plugins/verfiable-creds-manager';
import { FC, useContext } from 'react';
import { Card, SendHelloButton, TextInput } from '../../components';
import {
  MetamaskActions,
  MetaMaskContext,
} from '../../contexts/MetamaskContext';
import { VcContext } from '../../contexts/VcContext';
import {
  getCurrentNetwork,
  removeVC,
  shouldDisplayReconnectButton,
} from '../../utils';

type Props = {
  setCurrentChainId: React.Dispatch<React.SetStateAction<string>>;
};

const RemoveVC: FC<Props> = ({ setCurrentChainId }) => {
  const { setVcId, vcIdsToBeRemoved, setVcIdsToBeRemoved } =
    useContext(VcContext);
  const [state, dispatch] = useContext(MetaMaskContext);

  const handleRemoveVCClick = async () => {
    try {
      setCurrentChainId(await getCurrentNetwork());
      const id = vcIdsToBeRemoved ? vcIdsToBeRemoved.trim().split(',')[0] : '';
      const options = {
        // If you want to remove the VCs from multiple stores, you can pass an array like so:
        // store: ['snap', 'googleDrive'],
        store: 'snap',
      };
      console.log('vcIdsToBeRemoved: ', vcIdsToBeRemoved);
      const isRemoved = (await removeVC(
        id,
        options,
      )) as IDataManagerDeleteResult[];
      console.log(`Remove VC Result: ${JSON.stringify(isRemoved, null, 4)}`);
      setVcId('');
      setVcIdsToBeRemoved('');
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  return (
    <Card
      content={{
        title: 'removeVC',
        description: 'Remove one or more VCs from the snap',
        form: (
          <form>
            <label>
              Enter your VC IDs to be removed separated by a comma
              <TextInput
                rows={2}
                value={
                  vcIdsToBeRemoved ? vcIdsToBeRemoved.trim().split(',')[0] : ''
                }
                onChange={(e) => setVcIdsToBeRemoved(e.target.value)}
                fullWidth
              />
            </label>
          </form>
        ),
        button: (
          <SendHelloButton
            buttonText="Delete VC"
            onClick={handleRemoveVCClick}
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

export default RemoveVC;
