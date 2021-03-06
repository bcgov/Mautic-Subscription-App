
import { useKeycloak } from '@react-keycloak/web';
import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import { useConfig } from '../hooks/useConfig';

export const PrivateRoute = ({ component: Component, ...rest }) => {
    const { keycloak, initialized } = useKeycloak();
    const authorizedRolesJSON = useConfig('/config/authorizedRoles.json');

    const isMember = ( userRoles, authorizedRoles) => {
      const splitAuthorizedRoles = authorizedRoles.split(',');
      if (authorizedRoles.length===1 && splitAuthorizedRoles[0]==='') return true
      const result = userRoles.filter(role => splitAuthorizedRoles.indexOf(role) > -1);
      return result.length > 0
    }

    return initialized && (
        <Route
            {...rest}
            render={props => {
                return keycloak.authenticated && isMember(keycloak.realmAccess.roles, authorizedRolesJSON.authorizedRoles)
                    ? <Component {...props} />
                    : <Redirect to={{ pathname: '/401', }} />
            }}
        />
    )
}

export default PrivateRoute;    