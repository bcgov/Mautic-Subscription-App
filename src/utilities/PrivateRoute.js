
import { useKeycloak } from '@react-keycloak/web';
import React from 'react';
import { Redirect, Route } from 'react-router-dom';


export const PrivateRoute= ({ component: Component, ...rest }) => {
    const { keycloak, initialized } = useKeycloak();

    const isMember = ( keycloak ) => {
      const userRoles = keycloak.realmAccess.roles  
      const roles = ["github-org-bcgov", "github-org-bcgov-c", "github-org-bcdevops", "idir-user"];
      const result = userRoles.filter(role => roles.indexOf(role) > -1);
      if (result.length > 0) return true
      return false
    }

    return initialized && (
        <Route
            {...rest}
            render={props => {
                return keycloak.authenticated && isMember(keycloak)
                    ? <Component {...props} />
                    : <Redirect to={{ pathname: '/401', }} />
            }}
        />
    )
}

export default PrivateRoute;