import React from 'react';
import { useParams } from 'react-router-dom';

const FileUpdatePageComponent = () => {
  const { userId, fileId } = useParams();

  return (
    <div>
      <h2>File Update</h2>
      <div>userId is {userId}</div>
      <div>fileId is {fileId}</div>
    </div>
  );
};

export default FileUpdatePageComponent;
