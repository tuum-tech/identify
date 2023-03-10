import { IDataManagerQueryResult } from '@tuum-tech/identity-snap/src/veramo/plugins/verfiable-creds-manager';
import { FC, useContext, useState } from 'react';
import Select from 'react-select';
import { storeOptions } from '../../config/constants';
import {
  MetamaskActions,
  MetaMaskContext,
} from '../../contexts/MetamaskContext';
import { VcContext } from '../../contexts/VcContext';
import useModal from '../../hooks/useModal';
import {
  getCurrentNetwork,
  getVCs,
  shouldDisplayReconnectButton,
} from '../../utils';
import { Card, SendHelloButton } from '../base';

type Props = {
  setCurrentChainId: React.Dispatch<React.SetStateAction<string>>;
};

const GetAllVCs: FC<Props> = ({ setCurrentChainId }) => {
  const { setVcId, setVc, setVcIdsToBeRemoved } = useContext(VcContext);
  const [state, dispatch] = useContext(MetaMaskContext);
  const [selectedOptions, setSelectedOptions] = useState([storeOptions[0]]);
  const [loading, setLoading] = useState(false);
  const { showModal } = useModal();

  const handleChange = (options: any) => {
    setSelectedOptions(options);
  };

  const handleGetVCsClick = async () => {
    setLoading(true);
    try {
      setCurrentChainId(await getCurrentNetwork());
      const options = {
        // If you want to retrieve VCs from multiple stores, you can pass an array like so:
        // store: ['snap', 'googleDrive'],
        store: selectedOptions.map((option) => option.value),
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
          showModal({ title: 'Your VC IDs', content: keys.toString() });
        }
      }
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
    setLoading(false);
  };

  return (
    <Card
      content={{
        title: 'getAllVCs',
        description: 'Get all the VCs of the user',
        form: (
          <form>
            <label>Select store</label>
            <Select
              closeMenuOnSelect
              isMulti
              isSearchable={false}
              isClearable={false}
              options={storeOptions}
              value={selectedOptions}
              onChange={handleChange}
              styles={{
                control: (base: any) => ({
                  ...base,
                  border: `1px solid grey`,
                  marginBottom: 8,
                }),
              }}
            />
          </form>
        ),
        button: (
          <SendHelloButton
            buttonText="Retrieve all VCs"
            onClick={handleGetVCsClick}
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

export { GetAllVCs };