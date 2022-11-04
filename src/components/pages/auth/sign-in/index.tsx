import React, { useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useNavigate } from 'react-router';
import { useAuthUserContext } from '../../../../contexts/auth';
import { auth } from '../../../../utils/firebase';
import SignInCardWidgetComponent from '../../../widgets/card/SignInCard';

const AuthSignInPageComponent = () => {
  const { signInWithGoogle } = useAuthUserContext();
  const [authUser, authUserLoading] = useAuthState(auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (authUser) {
      navigate('/');
    }
  }, [authUser]);

  if (authUser || authUserLoading) {
    return null;
  }
  return <SignInCardWidgetComponent signInWithGoogle={signInWithGoogle} />;
};

export default AuthSignInPageComponent;
