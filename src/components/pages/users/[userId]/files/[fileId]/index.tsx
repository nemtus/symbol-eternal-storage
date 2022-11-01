import React from 'react';
import { useParams } from 'react-router-dom';

const FilePageComponent = () => {
  const { userId, fileId } = useParams();

  return (
    <div>
      <h2>File</h2>
      <div>userId is {userId}</div>
      <div>fileId is {fileId}</div>
    </div>
  );
};

export default FilePageComponent;
