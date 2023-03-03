/* eslint-disable no-alert */
import { IDataManagerQueryResult } from '@tuum-tech/identity-snap/src/veramo/plugins/verfiable-creds-manager';
import { FC, useContext } from 'react';
import { Card, SendHelloButton } from '..';
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

const GetAllVCs: FC<Props> = ({ setCurrentChainId }) => {
  const { setVcId, setVc, setVcIdsToBeRemoved } = useContext(VcContext);
  const [state, dispatch] = useContext(MetaMaskContext);

  const handleGetVCsClick = async () => {
    try {
      setCurrentChainId(await getCurrentNetwork());
      const options = {
        // If you want to retrieve VCs from multiple stores, you can pass an array like so:
        // store: ['snap', 'googleDrive'],
        store: 'snap',
        returnStore: true,
      };
      const vcs = (await getVCs(
        undefined,
        options,
      )) as IDataManagerQueryResult[];
      console.log(`Your VCs are: ${JSON.stringify(vcs, null, 4)}`);
      if (vcs.length > 0) {
        const keys = vcs.map((vc: { metadata: any }) => vc.metadata.id);
        if (keys.length > 0) {
          setVcId(keys.toString());
          setVcIdsToBeRemoved(keys.toString());
          setVc(vcs[keys.length - 1].data as IDataManagerQueryResult);
          alert(`Your VC IDs are: ${keys.toString()}`);
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
        title: 'getAllVCs',
        description: 'Get all the VCs of the user',
        button: (
          <SendHelloButton
            buttonText="Retrieve all VCs"
            onClick={handleGetVCsClick}
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

export { GetAllVCs };
