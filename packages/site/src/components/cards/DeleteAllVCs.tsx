/* eslint-disable no-alert */
import { IDataManagerClearResult } from '@tuum-tech/identity-snap/src/veramo/plugins/verfiable-creds-manager';
import { FC, useContext } from 'react';
import { Card, SendHelloButton } from '..';
import {
  MetamaskActions,
  MetaMaskContext,
} from '../../contexts/MetamaskContext';
import { VcContext } from '../../contexts/VcContext';
import {
  deleteAllVCs,
  getCurrentNetwork,
  shouldDisplayReconnectButton,
} from '../../utils';

type Props = {
  setCurrentChainId: React.Dispatch<React.SetStateAction<string>>;
};

const DeleteAllVCs: FC<Props> = ({ setCurrentChainId }) => {
  const { setVcId, setVcIdsToBeRemoved } = useContext(VcContext);
  const [state, dispatch] = useContext(MetaMaskContext);

  const handleDeleteAllVCsClick = async () => {
    try {
      setCurrentChainId(await getCurrentNetwork());
      const options = {
        // If you want to remove the VCs from multiple stores, you can pass an array like so:
        // store: ['snap', 'googleDrive'],
        store: 'snap',
      };
      const isRemoved = (await deleteAllVCs(
        options,
      )) as IDataManagerClearResult[];
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
        title: 'deleteAllVCs',
        description: 'Delete all the VCs from the snap',
        button: (
          <SendHelloButton
            buttonText="Delete all VCs"
            onClick={handleDeleteAllVCsClick}
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

export { DeleteAllVCs };
