import { FC, useContext, useRef, useState } from 'react';
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
import ExternalAccount, {
  GetExternalAccountRef,
} from '../sections/ExternalAccount';

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
  const { showModal } = useModal();

  const externalAccountRef = useRef<GetExternalAccountRef>(null);

  const handleGetAccountInfoClick = async () => {
    setLoading(true);
    try {
      const newChainId = await getCurrentNetwork();
      setCurrentChainId(newChainId);

      const externalAccountData =
        externalAccountRef.current?.handleGetAccountData();

      const params = validHederaChainID(newChainId)
        ? externalAccountData
        : undefined;
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
          <ExternalAccount
            currentChainId={currentChainId}
            ref={externalAccountRef}
          />
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
