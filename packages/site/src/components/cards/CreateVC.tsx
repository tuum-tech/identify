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
  createVC,
  getCurrentNetwork,
  shouldDisplayReconnectButton,
} from '../../utils';
import { Card, SendHelloButton } from '../base';

type Props = {
  setCurrentChainId: React.Dispatch<React.SetStateAction<string>>;
};

const CreateVC: FC<Props> = ({ setCurrentChainId }) => {
  const { setVcId, setVcIdsToBeRemoved } = useContext(VcContext);
  const [state, dispatch] = useContext(MetaMaskContext);
  const [createVCName, setCreateVCName] = useState('Kiran Pachhai');
  const [createVCNickname, setCreateVCNickname] = useState('KP Woods');
  const [selectedOptions, setSelectedOptions] = useState([storeOptions[0]]);
  const [loading, setLoading] = useState(false);
  const { showModal } = useModal();

  const handleChange = (options: any) => {
    setSelectedOptions(options);
  };

  const handleCreateVCClick = async () => {
    setLoading(true);
    try {
      setCurrentChainId(await getCurrentNetwork());
      const vcKey = 'profile';
      const vcValue = {
        name: createVCName,
        nickname: createVCNickname,
      };
      const options = {
        // If you want to auto save the generated VCs to multiple stores, you can pass an array like so:
        // store: ['snap', 'googleDrive'],
        store: selectedOptions.map((option) => option.value),
        returnStore: true,
      };
      const credTypes = ['ProfileNamesCredential'];
      const saved = await createVC(vcKey, vcValue, options, credTypes);
      const savedJson = JSON.parse(JSON.stringify(saved));
      if (savedJson.length > 0) {
        const vcIdsToAdd: any = [];
        savedJson.forEach((data: any) => {
          vcIdsToAdd.push(data.id);
        });
        setVcId(vcIdsToAdd.toString());
        setVcIdsToBeRemoved(vcIdsToAdd.toString());
        console.log('created and saved VC: ', saved);
        showModal({
          title: 'Create VC',
          content: `Created and saved VC:
          ${savedJson.map(
            (data: any) => `${JSON.stringify(data)}
          `,
          )}
          `,
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
