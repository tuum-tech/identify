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
    const [accountId, setAccountId] = useState('');

    const isHederaNetwork = useMemo(
      () => validHederaChainID(currentChainId),
      [currentChainId],
    );

    useImperativeHandle(ref, () => ({
      handleGetAccountParams() {
        return { externalAccount, accountId };
      },
    }));

    return (
      <>
        {isHederaNetwork ? (
          <Form>
            <Form.Check
              type="checkbox"
              id="external-account-checkbox"
              label="External Account"
              onChange={(e) => {
                setExternalAccount(e.target.checked);
              }}
            />
            <Form.Label>Account Id</Form.Label>
            <Form.Control
              size="lg"
              type="text"
              placeholder="Account Id"
              style={{ marginBottom: 8 }}
              onChange={(e) => setAccountId(e.target.value)}
            />
          </Form>
        ) : null}
      </>
    );
  },
);

export default ExternalAccount;