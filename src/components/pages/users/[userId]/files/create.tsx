import React from 'react';
import { useParams } from 'react-router-dom';

const FileCreatePageComponent = () => {
  const { userId } = useParams();

  return (
    <div>
      <h2>File Create</h2>
      <div>userId is {userId}</div>
    </div>
  );
};

export default FileCreatePageComponent;
