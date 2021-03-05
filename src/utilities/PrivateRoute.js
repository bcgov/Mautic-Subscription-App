
import { useKeycloak } from '@react-keycloak/web';
import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import { AUTHORIZED_SSO_ROLES } from '../constants'

export const PrivateRoute= ({ component: Component, ...rest }) => {
    const { keycloak, initialized } = useKeycloak();
    const authorizedRoles = useConfig('/config/authorizedRoles.json');

    const isMember = ( userRoles, authorizedRoles) => {
      authorizedRoles = authorizedRoles.split(',');
      if (authorizedRoles.length===1 && authorizedRoles[0]==='') return true
      const result = userRoles.filter(role => authorizedRoles.indexOf(role) > -1);
      return result.length > 0
    }

    return initialized && (
        <Route
            {...rest}
            render={props => {
                return keycloak.authenticated && isMember(keycloak.realmAccess.roles, AUTHORIZED_SSO_ROLES)
                    ? <Component {...props} />
                    : <Redirect to={{ pathname: '/401', }} />
            }}
        />
    )
}

export default PrivateRoute;