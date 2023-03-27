import { IDataManagerQueryResult } from '@tuum-tech/identity-snap/src/veramo/plugins/verfiable-creds-manager';
import { FC, useContext, useRef, useState } from 'react';
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
import { Card, SendHelloButton, TextInput } from '../base';
import ExternalAccount, {
  GetExternalAccountRef,
} from '../sections/ExternalAccount';

type Props = {
  currentChainId: string;
  setCurrentChainId: React.Dispatch<React.SetStateAction<string>>;
};

const GetSpecificVC: FC<Props> = ({ currentChainId, setCurrentChainId }) => {
  const { vcId, setVcId, setVc } = useContext(VcContext);
  const [state, dispatch] = useContext(MetaMaskContext);
  const [selectedOptions, setSelectedOptions] = useState([storeOptions[0]]);
  const [loading, setLoading] = useState(false);
  const { showModal } = useModal();

  const externalAccountRef = useRef<GetExternalAccountRef>(null);

  const handleChange = (options: any) => {
    setSelectedOptions(options);
  };

  const handleGetSpecificVCClick = async () => {
    setLoading(true);
    try {
      setCurrentChainId(await getCurrentNetwork());

      const externalAccountParams =
        externalAccountRef.current?.handleGetAccountParams();

      const filter = {
        type: 'id',
        filter: vcId ? vcId.trim().split(',')[0] : undefined,
      };
      const selectedStore = selectedOptions.map((option) => option.value);
      const options = {
        ...(selectedStore.length ? { store: selectedStore } : {}),
        returnStore: true,
      };
      const vcs = (await getVCs(
        filter,
        options,
        externalAccountParams,
      )) as IDataManagerQueryResult[];
      console.log(`Your VC is: ${JSON.stringify(vcs, null, 4)}`);
      if (vcs.length > 0) {
        const keys = vcs.map((vc: { metadata: any }) => vc.metadata.id);
        if (keys.length > 0) {
          setVc(vcs[keys.length - 1].data as IDataManagerQueryResult);
        }

        showModal({
          title: 'Your VCs',
          content: JSON.stringify(vcs, null, 4),
        });
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
        title: 'getSpecificVC',
        description: 'Get specific VC of the user',
        form: (
          <form>
            <ExternalAccount
              currentChainId={currentChainId}
              ref={externalAccountRef}
            />
            <label>
              Enter your VC Id
              <TextInput
                rows={2}
                value={vcId ? vcId.trim().split(',')[0] : ''}
                onChange={(e) => setVcId(e.target.value)}
                fullWidth
              />
            </label>
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
            buttonText="Retrieve VC"
            onClick={handleGetSpecificVCClick}
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

export { GetSpecificVC };
