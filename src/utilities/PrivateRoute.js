
import { useKeycloak } from '@react-keycloak/web';
import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import { useConfig } from '../hooks/useConfig';

export const PrivateRoute = ({ component: Component, ...rest }) => {
    const { keycloak, initialized } = useKeycloak();
    const authorizedRolesJSON = useConfig('/config/authorizedRoles.json');

    const isMember = ( userRoles, authorizedRolesJSON) => {
      /**
       * @param {string[]} userRoles user's roles in the realm
       * @param {string} authorizedRolesJSON JSON object containing comma separated values of authorized roles
       *  @returns {boolean} 
       */

      // Case where configmap for authorized roles does not exist. Assume everyone is authorized
      if (authorizedRolesJSON === null) return true

      const splitAuthorizedRoles = authorizedRolesJSON.authorizedRoles.split(',');

      // return true if no authorized roles are defined, since everyone would be authorized   
      if (splitAuthorizedRoles.length === 1 && splitAuthorizedRoles[0] === '') return true
      
      // check if the user is authorized
      const result = userRoles.filter(role => splitAuthorizedRoles.indexOf(role) > -1);
      return result.length > 0
    }

    return initialized && (
        <Route
            {...rest}
            render={props => {
                return keycloak.authenticated && isMember(keycloak.realmAccess.roles, authorizedRolesJSON)
                    ? <Component {...props} />
                    : <Redirect to={{ pathname: '/401', }} />
            }}
        />
    )   
}

export default PrivateRoute;    