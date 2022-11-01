import React, { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuthUserContext } from '../../../../contexts/auth';

const AuthSignInPageComponent = () => {
  const { authUser, signInWithGoogle } = useAuthUserContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (authUser) {
      navigate('/');
    }
  }, [authUser]);

  return (
    <div>
      <h2>Sign In</h2>
      <button onClick={signInWithGoogle}>Sign in with Google</button>
    </div>
  );
};

export default AuthSignInPageComponent;
