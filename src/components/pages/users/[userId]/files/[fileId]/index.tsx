import React, { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { useNavigate, useParams } from 'react-router-dom';
import { auth } from '../../../../../../utils/firebase';
import { privateUserFileDoc } from '../../../../../../utils/firebase/firestore';
import { PrivateUserFile } from '../../../../../../models/privateUserFile';
import PrivateUserFileCardWidgetComponent from '../../../../../widgets/card/PrivateUserFileCard';

const FilePageComponent = () => {
  const navigate = useNavigate();
  const { userId, fileId } = useParams();
  const [authUser, authUserLoading] = useAuthState(auth);
  const [privateUserFileDocumentData, privateUserFileDocumentDataLoading] = useDocumentData(
    privateUserFileDoc(userId ?? '', fileId ?? ''),
  );
  const [privateUserFile, setPrivateUserFile] = useState<PrivateUserFile | null>(null);

  useEffect(() => {
    if (!userId) {
      return;
    }
    if (!fileId) {
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
    if (privateUserFileDocumentDataLoading) {
      return;
    }
    if (!privateUserFileDocumentData) {
      return;
    }
    setPrivateUserFile(privateUserFileDocumentData as PrivateUserFile);
  }, [
    userId,
    fileId,
    authUser,
    authUserLoading,
    privateUserFileDocumentData,
    privateUserFileDocumentDataLoading,
    setPrivateUserFile,
  ]);

  if (!privateUserFile) {
    return null;
  }
  return <PrivateUserFileCardWidgetComponent privateUserFile={privateUserFile} />;
};

export default FilePageComponent;
