import React from 'react';

import { useKeycloak } from '@react-keycloak/web';
import { Redirect } from 'react-router';

export const Logout = () => {
  const { keycloak, initialized } = useKeycloak();
  console.log(keycloak)

  const logout = ( keycloak ) => {
    if (keycloak.authenticated){
      keycloak.logout( { redirectUri: `${window.location.origin}/` } )
    }
  }
  return (
    <div>
      {logout(keycloak)}
      </div>
  );
};

export default Logout;