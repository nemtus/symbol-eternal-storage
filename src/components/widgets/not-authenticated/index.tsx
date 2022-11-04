import React, { useEffect } from 'react';
import { useNavigate } from 'react-router';

const NotAuthenticatedWidgetComponent = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/');
  }, []);

  return (
    <div>
      <h2>Not Authenticated</h2>
    </div>
  );
};

export default NotAuthenticatedWidgetComponent;
