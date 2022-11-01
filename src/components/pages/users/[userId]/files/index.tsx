import React from 'react';
import { useParams } from 'react-router-dom';

const FilesPageComponent = () => {
  const { userId } = useParams();

  return (
    <div>
      <h2>Files</h2>
      <div>userId is {userId}</div>
    </div>
  );
};

export default FilesPageComponent;
