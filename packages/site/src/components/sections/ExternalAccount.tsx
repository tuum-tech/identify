import { forwardRef, Ref, useImperativeHandle, useMemo, useState } from 'react';
import Form from 'react-bootstrap/Form';
import { ExternalAccountParams } from '../../types';
import { validHederaChainID } from '../../utils/hedera';

export type GetExternalAccountRef = {
  handleGetAccountParams: () => ExternalAccountParams | undefined;
};

type Props = {
  currentChainId: string;
};

const ExternalAccount = forwardRef(
  ({ currentChainId }: Props, ref: Ref<GetExternalAccountRef>) => {
    const [externalAccount, setExternalAccount] = useState(false);
    const [extraData, setExtraData] = useState('');

    const isHederaNetwork = useMemo(
      () => validHederaChainID(currentChainId),
      [currentChainId],
    );

    useImperativeHandle(ref, () => ({
      handleGetAccountParams() {
        const network = isHederaNetwork ? 'hedera' : 'evm';
        const data =
          network === 'hedera'
            ? { accountId: extraData }
            : { address: extraData };
        let params;
        if (externalAccount) {
          params = {
            externalAccount: {
              network,
              data,
            },
          };
        }
        return params;
      },
    }));

    return (
      <>
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
            {isHederaNetwork ? 'Account Id' : 'EVM Address'}
          </Form.Label>
          <Form.Control
            size="lg"
            type="text"
            placeholder={isHederaNetwork ? 'Account Id' : 'EVM Address'}
            style={{ marginBottom: 8 }}
            onChange={(e) => setExtraData(e.target.value)}
          />
        </Form>
      </>
    );
  },
);

export default ExternalAccount;
