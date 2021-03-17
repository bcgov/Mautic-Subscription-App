import React from 'react';

import { useKeycloak } from '@react-keycloak/web';
import { Redirect } from 'react-router';

export const Logout = () => {
  const { keycloak, initialized } = useKeycloak();

  const logout = ( keycloak ) => {
    if (keycloak.authenticated){
      keycloak.logout( { redirectUri: `${window.location.origin}/` } )
    } else {
      return (
        <Redirect to={{ pathname: '/', }} />
      )
    }
  }
  
  return (
    <div>
      {logout(keycloak)}
    </div>
  );
};

export default Logout;