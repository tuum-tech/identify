import { AccountId } from '@hashgraph/sdk';
import { FC, useContext, useState } from 'react';
import {
  MetamaskActions,
  MetaMaskContext,
} from '../../contexts/MetamaskContext';
import useModal from '../../hooks/useModal';
import {
  createNewHederaAccount,
  getCurrentNetwork,
  shouldDisplayReconnectButton,
} from '../../utils';
import { Card, SendHelloButton } from '../base';

type Props = {
  setCurrentChainId: React.Dispatch<React.SetStateAction<string>>;
};

const CreateNewHederaAccount: FC<Props> = ({ setCurrentChainId }) => {
  const [state, dispatch] = useContext(MetaMaskContext);
  const [newAccountPublickey, setNewAccountPublickey] = useState(
    '302d300706052b8104000a032200034920445ae433dbfa7b11da73305566f143bfdff959779ac8a005b13a875460f2',
  );
  const [hbarAmountToSend, setHbarAmountToSend] = useState(0);
  const [loading, setLoading] = useState(false);

  const { showModal } = useModal();

  const handleCreateNewHederaAccount = async () => {
    setLoading(true);
    try {
      setCurrentChainId(await getCurrentNetwork());
      if (hbarAmountToSend > 0) {
        const newHederaAccountId = (await createNewHederaAccount(
          newAccountPublickey,
          hbarAmountToSend,
        )) as AccountId;
        console.log(`Your new hedera account Id: ${newHederaAccountId}`);
        showModal({
          title: 'New Hedera Account Id',
          content: `Your accountId is: ${newHederaAccountId}`,
        });
      } else {
        showModal({
          title: 'Error while creating a new hedera account',
          content: 'The amount of hbars must be greater than 0',
        });
      }
      setHbarAmountToSend(0);
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
    setLoading(false);
  };

  return (
    <Card
      content={{
        title: 'createNewHederaAccount',
        description:
          'Create a new hedera account by sending some HBARs to a hedera publickey address',
        form: (
          <form>
            <label>
              Enter the publickey address to create a hedera account for
              <input
                type="text"
                style={{ width: '100%' }}
                value={newAccountPublickey}
                onChange={(e) => setNewAccountPublickey(e.target.value)}
              />
            </label>
            <br />
            <label>
              Enter the amount of HBARs to send to fund this new hedera account
              <input
                type="number"
                style={{ width: '100%' }}
                value={hbarAmountToSend}
                onChange={(e) =>
                  setHbarAmountToSend(parseInt(e.target.value, 10))
                }
              />
            </label>
          </form>
        ),
        button: (
          <SendHelloButton
            buttonText="Create new hedera account"
            onClick={handleCreateNewHederaAccount}
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

export { CreateNewHederaAccount };
