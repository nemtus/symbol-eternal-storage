import React, { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuthUserContext } from '../../../contexts/auth';

const AppHeaderWidgetComponent = () => {
  const { authUser, signOut } = useAuthUserContext();
  const navigate = useNavigate();

  const handleNavigateToAuthSignInPage = () => {
    navigate('/auth/sign-in');
  };

  const handleNavigateToHomePage = () => {
    navigate('/');
  };

  const handleSignOut = async (): Promise<void> => {
    await signOut();
  };

  useEffect(() => {
    if (!authUser) {
      handleNavigateToHomePage();
    }
  }, [authUser]);

  return (
    <div>
      <h1>Symbol Eternal Storage</h1>
      {authUser ? (
        <button onClick={handleSignOut}>Sign out</button>
      ) : (
        <button onClick={handleNavigateToAuthSignInPage}>Sign in</button>
      )}
    </div>
  );
};

export default AppHeaderWidgetComponent;
