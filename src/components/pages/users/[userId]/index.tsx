import React from 'react';
import { useParams } from 'react-router-dom';

const UserPageComponent = () => {
  const { userId } = useParams();

  return (
    <div>
      <h2>User</h2>
      <div>userId is {userId}</div>
    </div>
  );
};

export default UserPageComponent;
