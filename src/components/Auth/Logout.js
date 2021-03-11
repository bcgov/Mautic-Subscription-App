
import React from 'react';
import { useKeycloak } from '@react-keycloak/web';
import { Redirect } from 'react-router';

export const Logout= () => {
  const { keycloak, initialized } = useKeycloak();
  if (keycloak.authenticated){
    keycloak.logout({ redirectUri: `${window.location.origin}/` })
  }
  return (
    <Redirect to={{ pathname: '/', }} />
  );
};

export default Logout;
