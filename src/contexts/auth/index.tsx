import React from 'react';
import { createContext, useState, useContext, useEffect } from 'react';
import {
  AuthUser,
  auth,
  signInWithRedirect,
  googleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from '../../utils/firebase';

interface AuthUserContextInterface {
  authUser: AuthUser | null;
  authUserLoading: boolean;
  authUserError: Error | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const signInWithGoogle = async () => {
  await signInWithRedirect(auth, googleAuthProvider);
};

const signOut = async () => {
  await firebaseSignOut(auth);
};

const AuthUserContext = createContext<AuthUserContextInterface>({
  authUser: null,
  authUserLoading: true,
  authUserError: null,
  signInWithGoogle,
  signOut,
});

export const useAuthUserContext = () => {
  return useContext(AuthUserContext);
};

export function AuthUserProvider({ children }: { children: React.ReactNode }) {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [authUserLoading, setAuthUserLoading] = useState<boolean>(false);
  const [authUserError, setAuthUserError] = useState<Error | null>(null);

  const signInWithGoogle = async () => {
    setAuthUserLoading(true);
    try {
      await signInWithRedirect(auth, googleAuthProvider);
    } catch (error) {
      setAuthUserError(error as Error);
    } finally {
      setAuthUserLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      setAuthUserError(error as Error);
    } finally {
      setAuthUserLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribed = onAuthStateChanged(
      auth,
      (currentAuthUser) => {
        setAuthUserLoading(true);
        setAuthUser(currentAuthUser);
        setAuthUserLoading(false);
      },
      (error) => {
        setAuthUserLoading(true);
        setAuthUserError(error);
        setAuthUserLoading(false);
      },
    );
    return () => {
      unsubscribed();
    };
  }, [setAuthUser, setAuthUserLoading, setAuthUserError]);

  const values = {
    authUser,
    authUserLoading,
    authUserError,
    signInWithGoogle,
    signOut,
  };

  return <AuthUserContext.Provider value={values}>{children}</AuthUserContext.Provider>;
}
