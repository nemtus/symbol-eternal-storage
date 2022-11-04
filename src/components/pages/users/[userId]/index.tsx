import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData, useDocumentData } from 'react-firebase-hooks/firestore';
import { auth } from '../../../../utils/firebase';
import { privateUserDoc, privateUserTransactionCollection } from '../../../../utils/firebase/firestore';
import PrivateUserCardWidgetComponent from '../../../widgets/card/PrivateUserCard';
import { PrivateUser } from '../../../../models/privateUser';
import { PrivateUserTransaction } from '../../../../models/privateUserTransaction';
import PrivateUserTransactionsTableCardWidgetComponent from '../../../widgets/card/PrivateUserTransactionsTableCard';

const UserPageComponent = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [authUser, authUserLoading] = useAuthState(auth);
  const [privateUserDocumentData, privateUserDocumentDataLoading] = useDocumentData(privateUserDoc(userId ?? ''));
  const [privateUser, setPrivateUser] = useState<PrivateUser | null>(null);
  const [privateUserTransactionCollectionData, privateUserTransactionCollectionDataLoading] = useCollectionData(
    privateUserTransactionCollection(userId ?? ''),
  );
  const [privateUserTransactions, setPrivateUserTransactions] = useState<PrivateUserTransaction[]>([]);

  useEffect(() => {
    if (!userId) {
      return;
    }
    if (authUserLoading) {
      return;
    }
    if (!authUser) {
      navigate('/not-authenticated');
      return;
    }
    if (authUser.uid !== userId) {
      navigate('/not-authenticated');
      return;
    }
    if (privateUserDocumentDataLoading) {
      return;
    }
    if (!privateUserDocumentData) {
      return;
    }
    if (authUser.uid !== privateUserDocumentData.userId) {
      navigate('/not-authenticated');
      return;
    }
    privateUserDocumentData.userCreatedAt = privateUserDocumentData.userCreatedAt.toDate();
    privateUserDocumentData.userUpdatedAt = privateUserDocumentData.userUpdatedAt.toDate();
    setPrivateUser(privateUserDocumentData as PrivateUser);
    if (privateUserTransactionCollectionDataLoading) {
      return;
    }
    if (!privateUserTransactionCollectionData) {
      return;
    }
    privateUserTransactionCollectionData.forEach((privateUserTransaction, index) => {
      privateUserTransaction.transactionCreatedAt = privateUserTransaction.transactionCreatedAt.toDate();
      privateUserTransaction.transactionUpdatedAt = privateUserTransaction.transactionUpdatedAt.toDate();
      privateUserTransactionCollectionData[index] = privateUserTransaction;
    });
    setPrivateUserTransactions(privateUserTransactionCollectionData as PrivateUserTransaction[]);
  }, [
    authUserLoading,
    privateUserDocumentDataLoading,
    privateUserDocumentData,
    privateUserTransactionCollectionData,
    setPrivateUserTransactions,
  ]);

  return (
    <>
      {privateUser ? <PrivateUserCardWidgetComponent {...privateUser} /> : null}
      {privateUserTransactions.length > 0 ? (
        <PrivateUserTransactionsTableCardWidgetComponent privateUserTransactions={privateUserTransactions} />
      ) : null}
    </>
  );
};

export default UserPageComponent;
