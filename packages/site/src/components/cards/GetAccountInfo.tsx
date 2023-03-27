import { FC, useContext, useMemo, useState } from 'react';
import Form from 'react-bootstrap/esm/Form';
import {
  MetamaskActions,
  MetaMaskContext,
} from '../../contexts/MetamaskContext';
import useModal from '../../hooks/useModal';
import {
  getAccountInfo,
  getCurrentNetwork,
  PublicAccountInfo,
  shouldDisplayReconnectButton,
} from '../../utils';
import { validHederaChainID } from '../../utils/hedera';
import { Card, SendHelloButton } from '../base';

type Props = {
  currentChainId: string;
  setCurrentChainId: React.Dispatch<React.SetStateAction<string>>;
  setAccountInfo: React.Dispatch<React.SetStateAction<PublicAccountInfo>>;
};

const GetAccountInfo: FC<Props> = ({
  currentChainId,
  setCurrentChainId,
  setAccountInfo,
}) => {
  const [state, dispatch] = useContext(MetaMaskContext);
  const [loading, setLoading] = useState(false);
  const [externalAccount, setExternalAccount] = useState(false);
  const [extraData, setExtraData] = useState('');
  const { showModal } = useModal();

  const isHederaNetwork = useMemo(
    () => validHederaChainID(currentChainId),
    [currentChainId],
  );

  const handleGetAccountInfoClick = async () => {
    setLoading(true);
    try {
      const newChainId = await getCurrentNetwork();
      setCurrentChainId(newChainId);
      const network = isHederaNetwork ? 'hedera' : 'evm';
      const data =
        network === 'hedera'
          ? { accountId: extraData }
          : { address: extraData };
      let params = undefined;
      if (externalAccount) {
        params = {
          externalAccount: {
            network,
            data,
          },
        };
      }
      const accountInfo = await getAccountInfo(params);
      console.log(`Your account info:`, accountInfo);
      setAccountInfo(accountInfo as PublicAccountInfo);
      showModal({
        title: 'Your account info',
        content: JSON.stringify(accountInfo),
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
        title: 'getAccountInfo',
        description: 'Get the current account information',
        form: (
          <Form>
            <Form.Check
              type="checkbox"
              id="external-account-checkbox"
              label="External Account"
              onChange={(e) => {
                setExternalAccount(e.target.checked);
              }}
            />
            <Form.Label>
              {isHederaNetwork ? 'Account Id' : 'Address'}
            </Form.Label>
            <Form.Control
              size="lg"
              type="text"
              placeholder={isHederaNetwork ? 'Account Id' : 'Address'}
              onChange={(e) => setExtraData(e.target.value)}
            />
          </Form>
        ),
        button: (
          <SendHelloButton
            buttonText="Get Account Info"
            onClick={handleGetAccountInfoClick}
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

export { GetAccountInfo };
