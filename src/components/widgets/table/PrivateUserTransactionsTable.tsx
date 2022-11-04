import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy } from '@fortawesome/free-solid-svg-icons';
import { PrivateUserTransaction } from '../../../models/privateUserTransaction';

const PrivateUserTransactionsTableWidgetComponent = (props: { privateUserTransactions: PrivateUserTransaction[] }) => {
  const { privateUserTransactions } = props;

  const handleClickCopy = async (copiedString: string) => {
    await navigator.clipboard.writeText(copiedString);
  };

  return (
    <table className="table table-compact w-full">
      <thead>
        <tr>
          <th>Transaction Hash</th>
          <th>Created at</th>
          <th>Updated at</th>
        </tr>
      </thead>
      <tbody>
        {privateUserTransactions.map((transaction) => (
          <tr key={transaction.transactionId}>
            <td>
              <div className="tooltip tooltip-right" data-tip="Copy">
                <button
                  className="btn btn-ghost"
                  onClick={async () => {
                    await handleClickCopy(transaction.transactionHash);
                  }}
                >
                  <FontAwesomeIcon icon={faCopy} />
                </button>
              </div>
              <a
                className="link link-primary"
                href={`${process.env.REACT_APP_SYMBOL_BLOCK_EXPLORER_URL}/transactions/${transaction.transactionHash}`}
              >
                {transaction.transactionHash}
              </a>
              <div className="tooltip tooltip-right" data-tip="Copy">
                <button
                  className="btn btn-ghost"
                  onClick={async () => {
                    await handleClickCopy(transaction.transactionHash);
                  }}
                >
                  <FontAwesomeIcon icon={faCopy} />
                </button>
              </div>
            </td>
            <td>
              {transaction.transactionCreatedAt.toLocaleDateString()},
              {transaction.transactionCreatedAt.toLocaleTimeString()}
            </td>
            <td>
              {transaction.transactionUpdatedAt.toLocaleDateString()},
              {transaction.transactionUpdatedAt.toLocaleTimeString()}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default PrivateUserTransactionsTableWidgetComponent;
