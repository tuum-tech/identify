import { CreateVCResponseResult } from '@tuum-tech/identity-snap/src/types/params';
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
  createVC,
  getCurrentNetwork,
  shouldDisplayReconnectButton,
} from '../../utils';
import { Card, SendHelloButton } from '../base';
import ExternalAccount, {
  GetExternalAccountRef,
} from '../sections/ExternalAccount';

type Props = {
  currentChainId: string;
  setCurrentChainId: React.Dispatch<React.SetStateAction<string>>;
};

const CreateVC: FC<Props> = ({ currentChainId, setCurrentChainId }) => {
  const { setVc } = useContext(VcContext);
  const { setVcId, setVcIdsToBeRemoved } = useContext(VcContext);
  const [state, dispatch] = useContext(MetaMaskContext);
  const [createVCName, setCreateVCName] = useState('Kiran Pachhai');
  const [createVCNickname, setCreateVCNickname] = useState('KP Woods');
  const [selectedOptions, setSelectedOptions] = useState([storeOptions[0]]);
  const [loading, setLoading] = useState(false);
  const { showModal } = useModal();

  const externalAccountRef = useRef<GetExternalAccountRef>(null);

  const handleChange = (options: any) => {
    setSelectedOptions(options);
  };

  const handleCreateVCClick = async () => {
    setLoading(true);
    try {
      setCurrentChainId(await getCurrentNetwork());

      const externalAccountParams =
        externalAccountRef.current?.handleGetAccountParams();

      const vcKey = 'profile';
      const vcValue = {
        name: createVCName,
        nickname: createVCNickname,
      };
      const selectedStore = selectedOptions.map((option) => option.value);
      const options = {
        // If you want to auto save the generated VCs to multiple stores, you can pass an array like so:
        // store: ['snap', 'googleDrive'],
        ...(selectedStore.length ? { store: selectedStore } : {}),
        returnStore: true,
      };
      const credTypes = ['ProfileNamesCredential'];
      const saved: CreateVCResponseResult = (await createVC(
        vcKey,
        vcValue,
        options,
        credTypes,
        externalAccountParams,
      )) as CreateVCResponseResult;
      if (saved) {
        const vcIdsToAdd: any = [saved.metadata.id];
        setVc(saved.data);
        setVcId(vcIdsToAdd.toString());
        setVcIdsToBeRemoved(vcIdsToAdd.toString());
        console.log('created and saved VC: ', saved);
        showModal({
          title: 'Created and saved VC',
          content: JSON.stringify(saved),
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
        title: 'createVC',
        description: 'Create and Save VerifiableCredential',
        form: (
          <form>
            <ExternalAccount
              currentChainId={currentChainId}
              ref={externalAccountRef}
            />
            <label>
              Enter your name
              <input
                type="text"
                style={{ width: '100%' }}
                value={createVCName}
                onChange={(e) => setCreateVCName(e.target.value)}
              />
            </label>
            <br />
            <label>
              Enter your nickname
              <input
                type="text"
                style={{ width: '100%' }}
                value={createVCNickname}
                onChange={(e) => setCreateVCNickname(e.target.value)}
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
            buttonText="Generate VC"
            onClick={handleCreateVCClick}
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

export { CreateVC };
