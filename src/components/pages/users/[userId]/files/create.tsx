import React from 'react';
import { useParams } from 'react-router-dom';
import PrivateUserFileUploadFormWidgetComponent from '../../../../widgets/form/PrivateUserFileUploadForm';

const FileCreatePageComponent = () => {
  const { userId } = useParams();

  if (!userId) {
    return null;
  }
  return <PrivateUserFileUploadFormWidgetComponent userId={userId} />;
};

export default FileCreatePageComponent;
