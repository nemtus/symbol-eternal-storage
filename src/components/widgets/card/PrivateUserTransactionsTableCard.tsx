import React from 'react';
import { PrivateUserTransaction } from '../../../models/privateUserTransaction';
import PrivateUserTransactionsTableWidgetComponent from '../table/PrivateUserTransactionsTable';

const PrivateUserTransactionsTableCardWidgetComponent = (props: {
  privateUserTransactions: PrivateUserTransaction[];
}) => {
  return (
    <>
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title justify-center">Transactions</h2>
          <div className="card-content flex justify-center w-full">
            <PrivateUserTransactionsTableWidgetComponent {...props} />
          </div>
        </div>
      </div>
    </>
  );
};

export default PrivateUserTransactionsTableCardWidgetComponent;
