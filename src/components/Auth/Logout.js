import React from 'react';

import { useKeycloak } from '@react-keycloak/web';
import { Redirect } from 'react-router';

export const Logout = () => {
  const { keycloak, initialized } = useKeycloak();
  
  return (
    keycloak.authenticated ? keycloak.logout({ redirectUri: `${window.location.origin}/` }) : <Redirect to={{ pathname: '/', }} />
  );
};

export default Logout;