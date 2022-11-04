import React from 'react';
import { useAuthUserContext } from '../../../contexts/auth';
import ServiceOverviewCardWidgetComponent from '../../widgets/card/ServiceOverviewCard';
import AuthSignInPageComponent from '../auth/sign-in';

const HomePageComponent = () => {
  const { authUser } = useAuthUserContext();

  return (
    <>
      <ServiceOverviewCardWidgetComponent authUser={authUser} />
      <AuthSignInPageComponent />
    </>
  );
};

export default HomePageComponent;
