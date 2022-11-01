import React from 'react';
import { useParams } from 'react-router-dom';

const UserUpdatePageComponent = () => {
  const { userId } = useParams();

  return (
    <div>
      <h2>User Update</h2>
      <div>userId is {userId}</div>
    </div>
  );
};

export default UserUpdatePageComponent;
